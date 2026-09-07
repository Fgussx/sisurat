$body = @{
    username = 'fagus'
    password = '123456'
    nama = 'Fagus Admin'
    id_role = '507f1f77bcf86cd799439011'
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:5000/api/create-user' -Method Post -ContentType 'application/json' -Body $body
$response.Content
