# Integrasi Midtrans SNAP

Dokumen ini berisi panduan untuk mengintegrasikan Midtrans SNAP ke dalam API Photobooth.

## Persiapan

1. Daftar akun di [Midtrans](https://midtrans.com/)
2. Dapatkan Server Key dan Client Key dari dashboard Midtrans
3. Tambahkan kunci-kunci tersebut ke file `.env`:
   ```
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   ```

## Endpoint API

### 1. Membuat Pembayaran

**Endpoint:** `POST /api/payment/create`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "amount": 50000,
  "description": "Photobooth Service",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "081234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pembayaran berhasil dibuat",
  "object": {
    "payment": {
      "id": 1,
      "orderId": "ORDER-1623456789",
      "amount": 50000,
      "status": "PENDING",
      "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/b82d-1623456789",
      "description": "Photobooth Service",
      "userId": 1
    },
    "token": "b82d-1623456789-a1b2c3d4",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/b82d-1623456789"
  }
}
```

### 2. Mendapatkan Status Pembayaran

**Endpoint:** `GET /api/payment/status/:orderId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "object": {
    "payment": {
      "id": 1,
      "orderId": "ORDER-1623456789",
      "amount": 50000,
      "status": "SUCCESS",
      "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/b82d-1623456789",
      "description": "Photobooth Service",
      "transaction_id": "9876-1623456789",
      "payment_type": "credit_card",
      "transaction_time": "2023-06-12T10:30:00Z",
      "transaction_status": "settlement",
      "fraud_status": "accept",
      "userId": 1
    }
  }
}
```

### 3. Mendapatkan Daftar Pembayaran

**Endpoint:** `GET /api/payment/list`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah item per halaman (default: 10)
- `sort`: Urutan (ASC atau DESC, default: DESC)

**Response:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10
  },
  "success": true,
  "message": "Payments retrieved successfully",
  "object": {
    "payments": [
      {
        "id": 2,
        "orderId": "ORDER-1623456790",
        "amount": 75000,
        "status": "PENDING"
      },
      {
        "id": 1,
        "orderId": "ORDER-1623456789",
        "amount": 50000,
        "status": "SUCCESS"
      }
    ]
  }
}
```

## Callback Notification

Midtrans akan mengirimkan notifikasi ke endpoint yang telah dikonfigurasi saat status pembayaran berubah.

**Endpoint:** `POST /api/payment/notification`

**Konfigurasi:**
1. Login ke dashboard Midtrans
2. Buka menu Settings > Configuration
3. Pada bagian "Payment Notification URL", masukkan URL endpoint notifikasi:
   ```
   https://your-api-domain.com/api/payment/notification
   ```
4. Simpan konfigurasi

## Implementasi di Frontend

Untuk mengimplementasikan Midtrans SNAP di frontend, ikuti langkah-langkah berikut:

1. Tambahkan script Midtrans di halaman HTML:
   ```html
   <script type="text/javascript"
     src="https://app.sandbox.midtrans.com/snap/snap.js"
     data-client-key="YOUR-CLIENT-KEY"></script>
   ```

2. Buat pembayaran melalui API:
   ```javascript
   // Contoh menggunakan fetch API
   const response = await fetch('/api/payment/create', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + userToken
     },
     body: JSON.stringify({
       amount: 50000,
       description: 'Photobooth Service',
       firstName: 'John',
       lastName: 'Doe',
       email: 'john@example.com',
       phone: '081234567890'
     })
   });
   
   const data = await response.json();
   
   // Tampilkan popup pembayaran Midtrans
   window.snap.pay(data.object.token, {
     onSuccess: function(result) {
       console.log('Pembayaran berhasil!', result);
       // Redirect ke halaman sukses
     },
     onPending: function(result) {
       console.log('Pembayaran tertunda!', result);
       // Tampilkan informasi pembayaran tertunda
     },
     onError: function(result) {
       console.log('Pembayaran gagal!', result);
       // Tampilkan pesan error
     },
     onClose: function() {
       console.log('Customer menutup popup tanpa menyelesaikan pembayaran');
       // Tampilkan pesan untuk melanjutkan pembayaran
     }
   });
   ```

## Catatan Penting

1. Gunakan mode sandbox untuk pengujian dengan mengatur `isProduction: false` pada konfigurasi Midtrans.
2. Untuk produksi, ubah ke `isProduction: true` dan gunakan kunci produksi dari dashboard Midtrans.
3. Pastikan endpoint notifikasi dapat diakses dari internet agar Midtrans dapat mengirimkan notifikasi.
4. Selalu verifikasi signature key pada notifikasi untuk memastikan keamanan.