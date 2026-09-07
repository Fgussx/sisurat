import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Role } from './models.js'

dotenv.config()

async function createAdminRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sisurat')
    console.log('MongoDB connected')

    // Check if Admin role already exists
    const existingRole = await Role.findOne({ nama_role: 'Admin' })
    
    if (existingRole) {
      console.log('Role Admin sudah ada di database')
      console.log('ID:', existingRole._id)
      console.log('Nama:', existingRole.nama_role)
      process.exit(0)
    }

    // Create new Admin role
    const adminRole = new Role({
      nama_role: 'Admin',
      keterangan: 'Administrator sistem dengan akses penuh',
    })

    const savedRole = await adminRole.save()
    console.log('✓ Role Admin berhasil dibuat!')
    console.log('ID:', savedRole._id)
    console.log('Nama:', savedRole.nama_role)
    console.log('Keterangan:', savedRole.keterangan)

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createAdminRole()
