package com.example.driver

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import io.flutter.plugin.common.EventChannel
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException

class LocationService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var socket: Socket? = null
    // CORRECTED: driverId is now a String
    private var driverId: String? = null
    private var token: String? = null
    private var serverUrl: String? = null

    companion object {
        private var eventSink: EventChannel.EventSink? = null
        private var hasActiveListeners = false
        const val NOTIFICATION_CHANNEL_ID = "LocationServiceChannel"
        const val NOTIFICATION_ID = 12345

        fun setEventSink(sink: EventChannel.EventSink?) {
            eventSink = sink
            hasActiveListeners = sink != null
            Log.d("LocationService", "Event sink ${if (sink != null) "set" else "cleared"}")
        }

        private fun sendUiUpdate(location: Location) {
            if (!hasActiveListeners) return

            try {
                Handler(Looper.getMainLooper()).post {
                    eventSink?.success(mapOf(
                        "lat" to location.latitude,
                        "lng" to location.longitude,
                        "speed" to location.speed.toDouble(),
                        "timestamp" to System.currentTimeMillis()
                    ))
                }
            } catch (e: Exception) {
                Log.e("LocationService", "Error sending location update to UI", e)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        Log.d("LocationService", "Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("LocationService", "Service starting")

        if (intent == null) {
            val prefs = getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
            token = prefs.getString("flutter.token", null)
            // CORRECTED: Read a String from SharedPreferences
            driverId = prefs.getString("flutter.driverId", null)
            serverUrl = prefs.getString("flutter.serverUrl", null)

            // CORRECTED: Check for null instead of -1
            if (token == null || driverId == null || serverUrl == null) {
                stopSelf()
                return START_NOT_STICKY
            }
        } else {
            token = intent.getStringExtra("token")
            // CORRECTED: Get String extra
            driverId = intent.getStringExtra("driverId")
            serverUrl = intent.getStringExtra("serverUrl")
        }

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Your location is being shared"))

        // CORRECTED: Check for null instead of -1
        if (token != null && driverId != null && serverUrl != null) {
            startLocationUpdates()
            connectSocket(serverUrl!!)
        } else {
            stopSelf()
        }

        return START_STICKY
    }

    private fun buildNotification(contentText: String): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("Driver Tracking Active")
            .setContentText(contentText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    private fun updateNotification(contentText: String) {
        val notification = buildNotification(contentText)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Location Service Channel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Channel for location tracking service"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun startLocationUpdates() {
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            10000L // 10 seconds
        ).apply {
            setMinUpdateIntervalMillis(5000L) // 5 seconds minimum
            setWaitForAccurateLocation(true)
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    val speedKmh = (location.speed * 3.6).toFloat()
                    Log.d("LocationService", "New location: ${location.latitude}, ${location.longitude}, Speed: ${speedKmh.format(1)} km/h")
                    sendLocationData(location)
                    updateNotification("Current speed: ${speedKmh.format(1)} km/h")
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            Log.d("LocationService", "Location updates started")
        } catch (e: SecurityException) {
            Log.e("LocationService", "Location permission not granted", e)
            stopSelf()
        }
    }

    private fun connectSocket(serverUrl: String) {
        try {
            val opts = IO.Options().apply {
                // Allow engine.io to pick best transport (long-polling fallback prevents websocket error loops)
                reconnection = true
                auth = mapOf("token" to token)
            }
            socket = IO.socket(serverUrl, opts).apply {
                on(Socket.EVENT_CONNECT) { Log.i("LocationService", "Socket connected") }
                on(Socket.EVENT_DISCONNECT) { args -> Log.w("LocationService", "Socket disconnected: ${args.joinToString()}") }
                on(Socket.EVENT_CONNECT_ERROR) { args -> Log.e("LocationService", "Socket connect error: ${args.getOrNull(0)}") }
                connect()
            }
            Log.d("LocationService", "Socket connection initiated")
        } catch (e: URISyntaxException) {
            Log.e("LocationService", "Invalid server URL", e)
            stopSelf()
        }
    }

    private fun sendLocationData(location: Location) {
        if (socket?.connected() == true) {
            val locationData = JSONObject().apply {
                put("userId", driverId)
                put("type", "driver")
                put("lat", location.latitude)
                put("lng", location.longitude)
                put("speedKmh", location.speed * 3.6)
                put("token", token)
                put("timestamp", System.currentTimeMillis())
            }
            socket?.emit("location-update", locationData)
        }
        sendUiUpdate(location)
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("LocationService", "Service destroyed - cleaning up")
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            socket?.disconnect()
        } catch (e: Exception) {
            Log.e("LocationService", "Error during cleanup", e)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

fun Float.format(digits: Int) = "%.${digits}f".format(this)


// package com.example.driver

// import android.app.Notification
// import android.app.NotificationChannel
// import android.app.NotificationManager
// import android.app.Service
// import android.content.Context
// import android.content.Intent
// import android.location.Location // <-- ADDED for type hinting
// import android.os.Build
// import android.os.Handler
// import android.os.IBinder
// import android.os.Looper
// import android.util.Log
// import androidx.core.app.NotificationCompat
// import com.google.android.gms.location.FusedLocationProviderClient
// import com.google.android.gms.location.LocationCallback
// import com.google.android.gms.location.LocationRequest
// import com.google.android.gms.location.LocationResult
// import com.google.android.gms.location.LocationServices
// import com.google.android.gms.location.Priority
// import io.flutter.plugin.common.EventChannel
// import io.socket.client.IO
// import io.socket.client.Socket
// import org.json.JSONObject
// import java.net.URISyntaxException

// class LocationService : Service() {
//     private lateinit var fusedLocationClient: FusedLocationProviderClient
//     private lateinit var locationCallback: LocationCallback
//     private var socket: Socket? = null
//     private var driverId: Int = -1
//     private var token: String? = null
//     private var serverUrl: String? = null

//     companion object {
//         private var eventSink: EventChannel.EventSink? = null
//         private var hasActiveListeners = false
//         const val NOTIFICATION_CHANNEL_ID = "LocationServiceChannel"
//         const val NOTIFICATION_ID = 12345

//         fun setEventSink(sink: EventChannel.EventSink?) {
//             eventSink = sink
//             hasActiveListeners = sink != null
//             Log.d("LocationService", "Event sink ${if (sink != null) "set" else "cleared"}")
//         }

//         // <-- MODIFIED: This function is now more capable
//         private fun sendUiUpdate(location: Location) {
//             if (!hasActiveListeners) return

//             try {
//                 Handler(Looper.getMainLooper()).post {
//                     // Send a map including the speed to the Flutter UI
//                     eventSink?.success(mapOf(
//                         "lat" to location.latitude,
//                         "lng" to location.longitude,
//                         "speed" to location.speed.toDouble(), // <-- ADDED: Send speed to Flutter
//                         "timestamp" to System.currentTimeMillis()
//                     ))
//                 }
//             } catch (e: Exception) {
//                 Log.e("LocationService", "Error sending location update to UI", e)
//             }
//         }
//     }

//     override fun onCreate() {
//         super.onCreate()
//         fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
//         Log.d("LocationService", "Service created")
//     }

//     override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
//         Log.d("LocationService", "Service starting")

//         if (intent == null) {
//             val prefs = getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
//             token = prefs.getString("flutter.token", null)
//             driverId = prefs.getInt("flutter.driverId", -1)
//             serverUrl = prefs.getString("flutter.serverUrl", null)

//             if (token == null || driverId == -1 || serverUrl == null) {
//                 stopSelf()
//                 return START_NOT_STICKY
//             }
//         } else {
//             token = intent.getStringExtra("token")
//             driverId = intent.getIntExtra("driverId", -1)
//             serverUrl = intent.getStringExtra("serverUrl")
//         }

//         createNotificationChannel()
//         startForeground(NOTIFICATION_ID, buildNotification("Your location is being shared"))

//         if (token != null && driverId != -1 && serverUrl != null) {
//             startLocationUpdates()
//             connectSocket(serverUrl!!)
//         } else {
//             stopSelf()
//         }

//         return START_STICKY
//     }

//     // <-- MODIFIED: Added a parameter to update the notification text
//     private fun buildNotification(contentText: String): Notification {
//         return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
//             .setContentTitle("Driver Tracking Active")
//             .setContentText(contentText)
//             .setSmallIcon(R.mipmap.ic_launcher)
//             .setPriority(NotificationCompat.PRIORITY_HIGH)
//             .setOngoing(true)
//             .setOnlyAlertOnce(true)
//             .build()
//     }

//     // <-- ADDED: Helper to update the notification text dynamically
//     private fun updateNotification(contentText: String) {
//         val notification = buildNotification(contentText)
//         val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//         notificationManager.notify(NOTIFICATION_ID, notification)
//     }

//     private fun createNotificationChannel() {
//         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//             val channel = NotificationChannel(
//                 NOTIFICATION_CHANNEL_ID,
//                 "Location Service Channel",
//                 NotificationManager.IMPORTANCE_LOW
//             ).apply {
//                 description = "Channel for location tracking service"
//             }
//             val manager = getSystemService(NotificationManager::class.java)
//             manager?.createNotificationChannel(channel)
//         }
//     }

//     private fun startLocationUpdates() {
//         val locationRequest = LocationRequest.Builder(
//             Priority.PRIORITY_HIGH_ACCURACY,
//             10000L // 10 seconds
//         ).apply {
//             setMinUpdateIntervalMillis(5000L) // 5 seconds minimum
//             setWaitForAccurateLocation(true)
//         }.build()

//         locationCallback = object : LocationCallback() {
//             // <-- MODIFIED: This is the core logic change
//             override fun onLocationResult(locationResult: LocationResult) {
//                 locationResult.lastLocation?.let { location ->
//                     val speedKmh = (location.speed * 3.6).toFloat() // Convert m/s to km/h
//                     Log.d("LocationService", "New location: ${location.latitude}, ${location.longitude}, Speed: ${speedKmh.format(1)} km/h")
                    
//                     // Send all data (including speed) to the server and UI
//                     sendLocationData(location)
                    
//                     // Update the notification with the current speed
//                     updateNotification("Current speed: ${speedKmh.format(1)} km/h")
//                 }
//             }
//         }

//         try {
//             fusedLocationClient.requestLocationUpdates(
//                 locationRequest,
//                 locationCallback,
//                 Looper.getMainLooper()
//             )
//             Log.d("LocationService", "Location updates started")
//         } catch (e: SecurityException) {
//             Log.e("LocationService", "Location permission not granted", e)
//             stopSelf()
//         }
//     }

//     private fun connectSocket(serverUrl: String) {
//         try {
//             val opts = IO.Options().apply {
//                 transports = arrayOf("websocket")
//                 auth = mapOf("token" to token)
//                 reconnection = true
//             }
//             socket = IO.socket(serverUrl, opts).apply {
//                 on(Socket.EVENT_CONNECT) { Log.i("LocationService", "Socket connected") }
//                 on(Socket.EVENT_DISCONNECT) { args -> Log.w("LocationService", "Socket disconnected: ${args.joinToString()}") }
//                 on(Socket.EVENT_CONNECT_ERROR) { args -> Log.e("LocationService", "Socket connect error: ${args[0]}") }
//                 connect()
//             }
//             Log.d("LocationService", "Socket connection initiated")
//         } catch (e: URISyntaxException) {
//             Log.e("LocationService", "Invalid server URL", e)
//             stopSelf()
//         }
//     }

//     // <-- MODIFIED: This function now handles sending all data
//     private fun sendLocationData(location: Location) {
//         // 1. Send to server via Socket.IO
//         if (socket?.connected() == true) {
//             val locationData = JSONObject().apply {
//                 put("driverId", driverId)
//                 put("lat", location.latitude)
//                 put("lng", location.longitude)
//                 put("speed", location.speed) // <-- ADDED: speed in m/s
//                 put("token", token)
//                 put("timestamp", System.currentTimeMillis())
//             }
//             socket?.emit("driverLocation", locationData)
//         }

//         // 2. Send to Flutter UI via EventChannel
//         sendUiUpdate(location)
//     }

//     override fun onDestroy() {
//         super.onDestroy()
//         Log.d("LocationService", "Service destroyed - cleaning up")
//         try {
//             fusedLocationClient.removeLocationUpdates(locationCallback)
//             socket?.disconnect()
//         } catch (e: Exception) {
//             Log.e("LocationService", "Error during cleanup", e)
//         }
//     }

//     override fun onBind(intent: Intent?): IBinder? = null
// }

// // <-- ADDED: A small helper extension function for formatting
// fun Float.format(digits: Int) = "%.${digits}f".format(this)