import { AmbulanceType, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/app/lib/prisma';
import { config, requiredEnv } from '../src/config';

const adminEmail = requiredEnv('ADMIN_EMAIL');
const adminPassword = requiredEnv('ADMIN_PASSWORD');
const demoPassword = requiredEnv('SEED_PASSWORD');

const hospitals = [
  {
    name: 'Dhaka Medical College Hospital',
    address: 'Secretariat Road, Shahbagh',
    area: 'Shahbagh',
    phone: '+8801711000101',
    specializations: ['EMERGENCY', 'TRAUMA', 'CARDIOLOGY'],
    availableBeds: 40,
  },
  {
    name: 'Square Hospitals Ltd',
    address: '18/F Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath',
    area: 'Panthapath',
    phone: '+8801711000102',
    specializations: ['CARDIOLOGY', 'NEUROLOGY', 'ICU'],
    availableBeds: 25,
  },
  {
    name: 'United Hospital Limited',
    address: 'Plot 15, Road 71, Gulshan 2',
    area: 'Gulshan',
    phone: '+8801711000103',
    specializations: ['EMERGENCY', 'ORTHOPEDICS', 'ICU'],
    availableBeds: 18,
  },
];

const ambulances = [
  {
    regNumber: 'DHA-AMB-1001',
    type: AmbulanceType.BASIC,
    baseFare: new Prisma.Decimal(500),
    perKmRate: new Prisma.Decimal(35),
    stationArea: 'Shahbagh',
  },
  {
    regNumber: 'DHA-AMB-1002',
    type: AmbulanceType.AC,
    baseFare: new Prisma.Decimal(800),
    perKmRate: new Prisma.Decimal(45),
    stationArea: 'Panthapath',
  },
  {
    regNumber: 'DHA-AMB-1003',
    type: AmbulanceType.ICU,
    baseFare: new Prisma.Decimal(2000),
    perKmRate: new Prisma.Decimal(80),
    stationArea: 'Gulshan',
  },
  {
    regNumber: 'DHA-AMB-1004',
    type: AmbulanceType.FREEZER,
    baseFare: new Prisma.Decimal(1500),
    perKmRate: new Prisma.Decimal(60),
    stationArea: 'Mirpur',
  },
];

const drivers = [
  {
    name: 'Rafiqul Islam',
    email: 'driver1@rapidaid.com',
    phone: '+8801811000201',
    licenseNumber: 'DL-RA-77120',
    nid: '1990771201234',
    ambulanceRegNumber: 'DHA-AMB-1001',
  },
  {
    name: 'Sohel Rana',
    email: 'driver2@rapidaid.com',
    phone: '+8801811000202',
    licenseNumber: 'DL-RA-77121',
    nid: '1991771201235',
    ambulanceRegNumber: 'DHA-AMB-1002',
  },
  {
    name: 'Jahangir Alam',
    email: 'driver3@rapidaid.com',
    phone: '+8801811000203',
    licenseNumber: 'DL-RA-77122',
    nid: '1992771201236',
    ambulanceRegNumber: 'DHA-AMB-1003',
  },
];

async function seedAdmin(passwordHash: string) {
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, password: passwordHash },
    create: {
      name: 'RapidAid Admin',
      email: adminEmail,
      password: passwordHash,
      phone: '+8801711000100',
      role: Role.ADMIN,
    },
  });
}

async function seedHospitals() {
  for (const hospital of hospitals) {
    const existing = await prisma.hospital.findFirst({
      where: { name: hospital.name, area: hospital.area },
      select: { id: true },
    });

    if (existing) {
      await prisma.hospital.update({ where: { id: existing.id }, data: hospital });
    } else {
      await prisma.hospital.create({ data: hospital });
    }
  }
}

async function seedAmbulances() {
  for (const ambulance of ambulances) {
    await prisma.ambulance.upsert({
      where: { regNumber: ambulance.regNumber },
      update: ambulance,
      create: ambulance,
    });
  }
}

async function seedDrivers(passwordHash: string) {
  for (const driver of drivers) {
    const ambulance = await prisma.ambulance.findUnique({
      where: { regNumber: driver.ambulanceRegNumber },
      select: { id: true },
    });

    const user = await prisma.user.upsert({
      where: { email: driver.email },
      update: { role: Role.DRIVER },
      create: {
        name: driver.name,
        email: driver.email,
        password: passwordHash,
        phone: driver.phone,
        role: Role.DRIVER,
      },
    });

    const profile = {
      licenseNumber: driver.licenseNumber,
      nid: driver.nid,
      isAvailable: true,
      ambulanceId: ambulance?.id ?? null,
    };

    await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: profile,
      create: { userId: user.id, ...profile },
    });
  }
}

async function seedPatient(passwordHash: string) {
  await prisma.user.upsert({
    where: { email: 'patient@rapidaid.com' },
    update: {},
    create: {
      name: 'Tanvir Ahmed',
      email: 'patient@rapidaid.com',
      password: passwordHash,
      phone: '+8801911000301',
      role: Role.PATIENT,
    },
  });
}

async function main() {
  const adminHash = await bcrypt.hash(adminPassword, config.bcryptSaltRounds);
  const demoHash = await bcrypt.hash(demoPassword, config.bcryptSaltRounds);

  await seedAdmin(adminHash);
  await seedHospitals();
  await seedAmbulances();
  await seedDrivers(demoHash);
  await seedPatient(demoHash);

  const [users, hospitalCount, ambulanceCount] = await Promise.all([
    prisma.user.count(),
    prisma.hospital.count(),
    prisma.ambulance.count(),
  ]);

  console.log(`Seeded: ${users} users, ${hospitalCount} hospitals, ${ambulanceCount} ambulances`);
  console.log(`Admin login: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
