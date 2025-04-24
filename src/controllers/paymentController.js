const Payment = require('../models/Payment');
const User = require('../models/User');
const midtransClient = require('midtrans-client');
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
// Pastikan URL callback bekerja dengan benar untuk struktur domain/photobooth-api/

// Konfigurasi Midtrans SNAP
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      description,
      firstName,
      lastName,
      email,
      phone
    } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Jumlah pembayaran tidak valid'
      });
    }

    const orderId = `ORDER-${Date.now()}`;
    
    // Buat parameter transaksi untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: firstName || 'Customer',
        last_name: lastName || '',
        email: email || 'customer@example.com',
        phone: phone || ''
      },
      credit_card: {
        secure: true
      },
      callbacks: {
        finish: `${baseUrl}/api/payment/finish`,
        error: `${baseUrl}/api/payment/error`,
        pending: `${baseUrl}/api/payment/pending`
      },
      item_details: [{
        id: 'PHOTOBOOTH1',
        price: amount,
        quantity: 1,
        name: description || 'Photobooth Service'
      }]
    };

    // Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);
    const paymentUrl = transaction.redirect_url;
    
    // Simpan data pembayaran ke database
    const payment = await Payment.create({
      orderId,
      amount,
      description,
      paymentUrl,
      userId
    });

    res.json({
      success: true,
      message: 'Pembayaran berhasil dibuat',
      object: {
        payment,
        token: transaction.token,
        redirect_url: paymentUrl
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Gagal membuat pembayaran'
    });
  }
}

exports.getStatus = async (req, res) => {
  try {
    const {
      orderId
    } = req.params;
    const payment = await Payment.findOne({
      where: {
        orderId
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment status retrieved successfully',
      object: {
        payment
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });

  }
}

exports.simulateCallback = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const payment = await Payment.findOne({
      where: {
        orderId
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Pembayaran tidak ditemukan',
      });
    }

    await payment.update({
      status
    });
    res.json({
      success: true,
      message: 'Status pembayaran berhasil diperbarui',
      object: {
        payment
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
}

// Endpoint untuk menerima notifikasi dari Midtrans
exports.midtransNotification = async (req, res) => {
  try {
    const notificationJson = req.body;
    
    // Verifikasi signature key untuk memastikan notifikasi berasal dari Midtrans
    const statusResponse = await snap.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const transactionId = statusResponse.transaction_id;
    const paymentType = statusResponse.payment_type;
    const transactionTime = statusResponse.transaction_time;

    console.log(`Notifikasi diterima. Order ID: ${orderId}. Status Transaksi: ${transactionStatus}. Status Fraud: ${fraudStatus}`);

    // Cari pembayaran berdasarkan orderId
    const payment = await Payment.findOne({
      where: {
        orderId
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Pembayaran tidak ditemukan',
      });
    }

    // Update status pembayaran berdasarkan status transaksi dari Midtrans
    let paymentStatus;
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        paymentStatus = 'PENDING';
      } else if (fraudStatus == 'accept') {
        paymentStatus = 'SUCCESS';
      }
    } else if (transactionStatus == 'settlement') {
      paymentStatus = 'SUCCESS';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      paymentStatus = 'FAILED';
    } else if (transactionStatus == 'pending') {
      paymentStatus = 'PENDING';
    } else if (transactionStatus == 'expired') {
      paymentStatus = 'EXPIRED';
    }

    // Update status pembayaran dan detail transaksi di database
    await payment.update({
      status: paymentStatus,
      transaction_id: transactionId,
      payment_type: paymentType,
      transaction_time: transactionTime,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus
    });

    return res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil diproses'
    });
  } catch (error) {
    console.error('Error processing notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Gagal memproses notifikasi'
    });
  }
}

// Callback handler untuk status finish dari Midtrans
exports.finishCallback = async (req, res) => {
  try {
    const { order_id } = req.query;
    console.log('Finish callback received for order:', order_id);
    
    // Redirect ke halaman sukses di frontend
    res.redirect(`${baseUrl}/payment/success?order_id=${order_id}`);
  } catch (error) {
    console.error('Error in finish callback:', error);
    res.redirect(`${baseUrl}/payment/error`);
  }
};

// Callback handler untuk status error dari Midtrans
exports.errorCallback = async (req, res) => {
  try {
    const { order_id } = req.query;
    console.log('Error callback received for order:', order_id);
    
    // Redirect ke halaman error di frontend
    res.redirect(`${baseUrl}/payment/error?order_id=${order_id}`);
  } catch (error) {
    console.error('Error in error callback:', error);
    res.redirect(`${baseUrl}/payment/error`);
  }
};

// Callback handler untuk status pending dari Midtrans
exports.pendingCallback = async (req, res) => {
  try {
    const { order_id } = req.query;
    console.log('Pending callback received for order:', order_id);
    
    // Redirect ke halaman pending di frontend
    res.redirect(`${baseUrl}/payment/pending?order_id=${order_id}`);
  } catch (error) {
    console.error('Error in pending callback:', error);
    res.redirect(`${baseUrl}/payment/error`);
  }
};

exports.getPaymentList = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'DESC';
   
    if(sort !== 'ASC' && sort !== 'DESC'){
      return res.status(400).json({
        success: false,
        error: 'Invalid sort parameter',
      });
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      attributes: ['id', 'orderId', 'amount', 'status'],
      where: {
        userId: userId
      },
      order: [
        ['createdAt', sort]
      ], // Newest first
      offset,
      limit
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      },
      success: true,
      message: 'Payments retrieved successfully',
      object: {
        payments,

      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve payments'
    });
  }
};