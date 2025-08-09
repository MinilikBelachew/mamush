import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '@utils/prisma.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

// export const registerDriver = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       street,
//       streetNumber,
//       city,
//       zip,
//       capacity,
//       availabilityStart,
//       availabilityEnd,
//     } = req.body;

//     const fullAddress = `${streetNumber} ${street}, ${city}, ${zip}, USA`;
//     const geoApiKey = process.env.OPENCAGE_API_KEY;

//     if (!geoApiKey) {
//       console.error('Missing OpenCage API key!');
//       return res.status(500).json({ message: 'Geocoding API key missing' });
//     }

//     console.log('📦 Full Address:', fullAddress);
//     console.log('🔑 API Key Present:', !!geoApiKey);

//     const response = await axios.get(
//       'https://api.opencagedata.com/geocode/v1/json',
//       {
//         params: {
//           key: geoApiKey,
//           q: fullAddress,
//           limit: 1,
//           // Removed countrycode: 'de'
//         },
//       }
//     );

//     const geoData = response.data;
//     console.log('📍 Geocoding response:', geoData);

//     if (!geoData.results.length) {
//       return res
//         .status(400)
//         .json({ message: 'Invalid address. Please check the input.' });
//     }

//     const { lat, lng } = geoData.results[0].geometry;

//     const newDriver = await prisma.driver.create({
//       data: {
//         name,
//         currentLat: lat,
//         currentLng: lng,
//         capacity,
//         availabilityStart: new Date(availabilityStart),
//         availabilityEnd: new Date(availabilityEnd),
//         status: 'IDLE',
//       },
//     });

//     return res.status(201).json({
//       message: 'Driver registered successfully',
//       driver: newDriver,
//     });
//   } catch (error) {
//     console.error('❌ Error registering driver:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getDrivers = async (req: Request, res: Response) => {
//   try {
//     const drivers = await prisma.driver.findMany({
//       // where: {
//       //   // status: { not: 'DELETED' } // Exclude deleted drivers
//       // }
//     });

//     if (!drivers || drivers.length === 0) {
//       return res.status(404).json({ message: 'No drivers found.' });
//     }

//     return res.status(200).json(drivers);
//   } catch (error) {
//     console.error('Error fetching drivers:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const registerDriver = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleInitial,
      lastName,
      dateOfBirth,
      mdtUsername,
      password,
      street,
      streetNumber,
      city,
      state,
      zipCode,
      phone,
      phoneExtension,
      employeeNumber,
      driverLicenseNumber,
      driverLicenseState,
      driverLicenseExpiration,
      hireDate,
      terminationDate,
      seniority,
      skill,
      vehicle,
      provider,
      note,
      capacity,
      availabilityStart,
      availabilityEnd,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      emergencyContactPhoneExtension,
      emergencyContactNote,
    } = req.body;

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const fullAddress = `${streetNumber} ${street}, ${city}, ${state} ${zipCode}, USA`;
    const mapboxApiKey = process.env.MAPBOX_API_KEY;

    if (!mapboxApiKey) {
      return res
        .status(500)
        .json({ message: 'Mapbox API key is required for geocoding.' });
    }

    console.log('📦 Full Address:', fullAddress);
    console.log('🔑 Mapbox API Key Present:', !!mapboxApiKey);

    let lat: number;
    let lng: number;

    try {
      // Encode the address for URL
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
        {
          params: {
            access_token: mapboxApiKey,
            limit: 1,
            types: 'address',
          },
        }
      );

      const geoData = response.data;
      console.log('📍 Mapbox Geocoding response:', geoData);

      if (!geoData.features || geoData.features.length === 0) {
        return res
          .status(400)
          .json({
            message:
              'Could not geocode the provided address. Please check the address and try again.',
          });
      }

      [lng, lat] = geoData.features[0].center; // Mapbox returns [lng, lat]
      console.log('📍 Coordinates found:', { lat, lng });
    } catch (error: any) {
      console.error('❌ Mapbox geocoding service error:', error.message);
      return res
        .status(500)
        .json({
          message:
            'Geocoding service is currently unavailable. Please try again later.',
        });
    }

    const newDriver = await prisma.driver.create({
      data: {
        firstName,
        middleInitial,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        mdtUsername,
        passwordHash,
        street,
        streetNumber,
        city,
        state,
        zipCode,
        phone,
        phoneExtension,
        employeeNumber,
        driverLicenseNumber,
        driverLicenseState,
        driverLicenseExpiration: driverLicenseExpiration
          ? new Date(driverLicenseExpiration)
          : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        terminationDate: terminationDate ? new Date(terminationDate) : null,
        seniority,
        skill,
        vehicle,
        provider,
        note,
        capacity,
        availabilityStart: new Date(availabilityStart),
        availabilityEnd: new Date(availabilityEnd),
        emergencyContactName,
        emergencyContactRelation,
        emergencyContactPhone,
        emergencyContactPhoneExtension,
        emergencyContactNote,
        currentLat: lat,
        currentLng: lng,
        status: 'IDLE',
      },
    });

    // Remove passwordHash from response for security
    const { passwordHash: _, ...driverResponse } = newDriver;

    return res.status(201).json({
      message: 'Driver registered successfully',
      driver: driverResponse,
    });
  } catch (error: any) {
    console.error('❌ Error registering driver:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('mdtUsername')) {
      return res.status(409).json({ message: 'MDT Username already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginDriver = async (req: Request, res: Response) => {
  try {
    const { mdtUsername, password } = req.body;

    // 1. Find the driver by MDT username
    const driver = await prisma.driver.findUnique({
      where: { mdtUsername },
    });

    if (!driver) {
      return res
        .status(401)
        .json({ message: 'Invalid MDT Username or password.' });
    }

    // 2. Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, driver.passwordHash);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Invalid MDT Username or password.' });
    }

    // 3. Generate a JWT token
    const token = jwt.sign(
      {
        driverId: driver.id,
        mdtUsername: driver.mdtUsername,
        name: `${driver.firstName} ${driver.lastName}`,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Driver logged in successfully',
      token,
      driver: {
        id: driver.id,
        firstName: driver.firstName,
        middleInitial: driver.middleInitial,
        lastName: driver.lastName,
        name: `${driver.firstName} ${driver.lastName}`,
        mdtUsername: driver.mdtUsername,
        status: driver.status,
        dateOfBirth: driver.dateOfBirth,
        phone: driver.phone,
        phoneExtension: driver.phoneExtension,
        employeeNumber: driver.employeeNumber,
        driverLicenseNumber: driver.driverLicenseNumber,
        driverLicenseState: driver.driverLicenseState,
        driverLicenseExpiration: driver.driverLicenseExpiration,
        hireDate: driver.hireDate,
        seniority: driver.seniority,
        skill: driver.skill,
        vehicle: driver.vehicle,
        note: driver.note,
        capacity: driver.capacity,
        currentLat: driver.currentLat,
        currentLng: driver.currentLng,
        availabilityStart: driver.availabilityStart,
        availabilityEnd: driver.availabilityEnd,
        // Address information
        street: driver.street,
        streetNumber: driver.streetNumber,
        city: driver.city,
        state: driver.state,
        zipCode: driver.zipCode,
        // Emergency contact information
        emergencyContactName: driver.emergencyContactName,
        emergencyContactRelation: driver.emergencyContactRelation,
        emergencyContactPhone: driver.emergencyContactPhone,
        emergencyContactPhoneExtension: driver.emergencyContactPhoneExtension,
        emergencyContactNote: driver.emergencyContactNote,
        // Timestamps
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error logging in driver:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await prisma.driver.findMany({
      select: {
        id: true,
        firstName: true,
        middleInitial: true,
        lastName: true,
        mdtUsername: true,
        status: true,
        dateOfBirth: true,
        phone: true,
        phoneExtension: true,
        employeeNumber: true,
        driverLicenseNumber: true,
        driverLicenseState: true,
        driverLicenseExpiration: true,
        hireDate: true,
        seniority: true,
        skill: true,
        vehicle: true,
        note: true,
        capacity: true,
        currentLat: true,
        currentLng: true,
        availabilityStart: true,
        availabilityEnd: true,
        street: true,
        streetNumber: true,
        city: true,
        state: true,
        zipCode: true,
        emergencyContactName: true,
        emergencyContactRelation: true,
        emergencyContactPhone: true,
        emergencyContactPhoneExtension: true,
        emergencyContactNote: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!drivers || drivers.length === 0) {
      return res.status(404).json({ message: 'No drivers found.' });
    }

    // Add computed name field
    const driversWithName = drivers.map((driver) => ({
      ...driver,
      name: `${driver.firstName} ${driver.lastName}`,
    }));

    return res.status(200).json(driversWithName);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    const { passwordHash, id: driverId, ...safeUpdateData } = updateData;

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: safeUpdateData,
    });

    return res.status(200).json({
      message: 'Driver updated successfully',
      driver: updatedDriver,
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        middleInitial: true,
        lastName: true,
        mdtUsername: true,
        status: true,
        dateOfBirth: true,
        phone: true,
        phoneExtension: true,
        employeeNumber: true,
        driverLicenseNumber: true,
        driverLicenseState: true,
        driverLicenseExpiration: true,
        hireDate: true,
        seniority: true,
        skill: true,
        vehicle: true,
        note: true,
        capacity: true,
        currentLat: true,
        currentLng: true,
        availabilityStart: true,
        availabilityEnd: true,
        street: true,
        streetNumber: true,
        city: true,
        state: true,
        zipCode: true,
        emergencyContactName: true,
        emergencyContactRelation: true,
        emergencyContactPhone: true,
        emergencyContactPhoneExtension: true,
        emergencyContactNote: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    // Add computed name field
    const driverWithName = {
      ...driver,
      name: `${driver.firstName} ${driver.lastName}`,
    };

    return res.status(200).json(driverWithName);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.driver.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
