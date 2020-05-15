cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-mqtt.MQTTEmitter",
      "file": "plugins/cordova-plugin-mqtt/www/MQTTEmitter.js",
      "pluginId": "cordova-plugin-mqtt",
      "clobbers": [
        "ME"
      ]
    },
    {
      "id": "cordova-plugin-mqtt.CordovaMqTTPlugin",
      "file": "plugins/cordova-plugin-mqtt/www/cordova-plugin-mqtt.js",
      "pluginId": "cordova-plugin-mqtt",
      "clobbers": [
        "cordova.plugins.CordovaMqTTPlugin"
      ]
    },
    {
      "id": "cordova-plugin-device.device",
      "file": "plugins/cordova-plugin-device/www/device.js",
      "pluginId": "cordova-plugin-device",
      "clobbers": [
        "device"
      ]
    },
    {
      "id": "cordova-plugin-badge.Badge",
      "file": "plugins/cordova-plugin-badge/www/badge.js",
      "pluginId": "cordova-plugin-badge",
      "clobbers": [
        "cordova.plugins.notification.badge"
      ]
    },
    {
      "id": "cordova-plugin-local-notification.LocalNotification",
      "file": "plugins/cordova-plugin-local-notification/www/local-notification.js",
      "pluginId": "cordova-plugin-local-notification",
      "clobbers": [
        "cordova.plugins.notification.local"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.4",
    "cordova-plugin-mqtt": "0.3.8",
    "cordova-plugin-device": "2.0.3",
    "cordova-plugin-badge": "0.8.8",
    "cordova-plugin-local-notification": "0.9.0-beta.3"
  };
});