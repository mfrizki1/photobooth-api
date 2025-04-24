# Konfigurasi Nginx untuk Photobooth API

Untuk mengubah URL dari `localhost:3000` menjadi `domainsaya.com/photobooth-api/`, Anda perlu mengonfigurasi Nginx sebagai reverse proxy. Berikut adalah langkah-langkah dan contoh konfigurasi yang diperlukan:

## Langkah-langkah Konfigurasi

1. Pastikan Nginx sudah terinstal di server Anda
2. Buat file konfigurasi baru atau edit file konfigurasi yang sudah ada
3. Tambahkan konfigurasi berikut

## Contoh Konfigurasi Nginx

```nginx
server {
    listen 80;
    server_name domainsaya.com;

    # Konfigurasi untuk photobooth-api
    location /photobooth-api/ {
        # Menghapus prefix /photobooth-api sebelum meneruskan ke aplikasi
        rewrite ^/photobooth-api/?(.*)$ /$1 break;
        
        # Proxy pass ke aplikasi Node.js yang berjalan di port 3000
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Konfigurasi lain untuk domain Anda jika ada
    # ...
}
```

## Penjelasan Konfigurasi

- `server_name domainsaya.com`: Ganti dengan nama domain Anda yang sebenarnya
- `location /photobooth-api/`: Mendefinisikan path URL yang akan digunakan untuk mengakses API
- `rewrite ^/photobooth-api/?(.*)$ /$1 break`: Menghapus prefix `/photobooth-api` dari URL sebelum meneruskannya ke aplikasi
- `proxy_pass http://localhost:3000/`: Meneruskan permintaan ke aplikasi Node.js yang berjalan di port 3000

## Langkah Selanjutnya

1. Simpan konfigurasi Nginx
2. Periksa sintaks konfigurasi: `sudo nginx -t`
3. Muat ulang Nginx: `sudo systemctl reload nginx` atau `sudo service nginx reload`

## Catatan Penting

1. Anda telah mengubah `BASE_URL` di file `.env` menjadi `https://domainsaya.com/photobooth-api`
2. Pastikan aplikasi Node.js Anda berjalan di port 3000 (atau sesuaikan port di konfigurasi Nginx)
3. Jika Anda menggunakan HTTPS, tambahkan konfigurasi SSL yang sesuai
4. Pastikan firewall Anda mengizinkan lalu lintas pada port 80 (HTTP) dan 443 (HTTPS)

## Pengujian

Setelah konfigurasi selesai, Anda dapat mengakses API melalui:

```
https://domainsaya.com/photobooth-api/api/auth/...
https://domainsaya.com/photobooth-api/api/payment/...
https://domainsaya.com/photobooth-api/api/images/...
```

Dan callback URL Midtrans akan bekerja dengan benar menggunakan:

```
https://domainsaya.com/photobooth-api/api/payment/notification
https://domainsaya.com/photobooth-api/api/payment/finish
https://domainsaya.com/photobooth-api/api/payment/error
https://domainsaya.com/photobooth-api/api/payment/pending
```