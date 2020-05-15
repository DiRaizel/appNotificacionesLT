//
var reloj = '';
var hora = 0;
var minuto = 0;
var tipoHora = '';
var intervaloPedidos;
//-----------------------------Reloj en vivo------------------------------------

function show5() {
    if (!document.layers && !document.all && !document.getElementById)
        return;

    var Digital = new Date();
    var hours = Digital.getHours();
    var minutes = Digital.getMinutes();
    var seconds = Digital.getSeconds();

    var dn = "PM";
    if (hours < 12)
        dn = "AM";
    if (hours > 12)
        hours = hours - 12;
    if (hours == 0)
        hours = 12;

    if (minutes <= 9)
        minutes = "0" + minutes;
    if (seconds <= 9)
        seconds = "0" + seconds;
    //change font size here to your desire
    myclock = hours + ":" + minutes + ":" + seconds + " " + dn;
    //
    tipoHora = dn;
    myclock2 = hours + ":" + minutes;
    hora = parseInt(hours);
    minuto = parseInt(minutes);

    if (document.layers) {
        document.layers.liveclock.document.write(myclock);
        document.layers.liveclock.document.close();
    } else if (document.all)
        liveclock.innerHTML = myclock;
    else if (document.getElementById)
        reloj = myclock2;
}

//-----------------------------------App----------------------------------------

//
var app = new Framework7({
    // App root element
    root: '#appNotificacionesLT',
    // App Name
    name: 'appNotificacionesLT',
    // App id
    id: 'com.appNotificacionesLT',
    // Enable swipe panel
    panel: {
        swipe: 'left'
    },
    // Add default routes
    routes: [{
            path: '/home/',
            url: 'home.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized

                }
            }
        },
        {
            path: '/login/',
            url: 'index.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                }
            }
        }
    ],
    lazy: {
        threshold: 50,
        sequential: false
    }
    // ... other parameters
});

//
var $$ = Dom7;

//
var mainView = app.views.create('.view-main');

//
var urlServidor = 'http://192.168.0.12/';

//
document.addEventListener('deviceready', function () {
    //
    setTimeout("show5()", 1000);
    //
    if (localStorage.idUsu !== undefined) {
        //
        app.views.main.router.navigate('/home/');
    }
    //
    cordova.plugins.CordovaMqTTPlugin.connect({
        url: 'tcp://165.227.89.32', //a public broker used for testing purposes only. Try using a self hosted broker for production.
        port: '1883',
        clientId: 'com.appNotificacionesLT',
        willTopicConfig: {
            qos: 0, //default is 0
            retain: false, //default is true
            topic: "appNotificacionesLT/notificaciones",
            payload: ""
        },
        username: "fabian",
        password: '1234',
        success: function (s) {
            subscribirse();
        },
        error: function (e) {
//            console.log('error: ' + e);
        },
        onConnectionLost: function (e) {
//            console.log('conexion perdida: ' + e);
        }
    });
    //
    cordova.plugins.notification.local.setDefaults({
        led: {color: '#FFFFFF', on: 500, off: 500},
        vibrate: true
    });
}, false);

//----------------------------------Login---------------------------------------

//
function login(valor) {
    //
    var formElement = document.getElementById("formLogin");
    formData = new FormData(formElement);
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/login',
        data: formData,
        method: "post",
        beforeSend: function () {
            //
            app.preloader.show();
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            if (data.estado == 'Entra') {
                //
                localStorage.idUsu = data.idUsu;
                //
//                $$('#btnPedidosMenu').css('display', '');
//                $$('#btnSessionMenu').css('display', 'none');
                //
                setTimeout(function () {
                    //
                    app.preloader.hide();
                    //
                    app.views.main.router.navigate('/home/');
                }, 500);
            } else {
                //
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Alerta!',
                    text: 'El correo ingresado no se encuentra registrado o la contraseña es incorrrecta.',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });
}

//
function cerrarSesion() {
    //
    delete localStorage.idUsu;
    //
    app.views.main.router.navigate('/login/');
}

//---------------------------------Home-----------------------------------------

//
function cargar() {
    //
    var campos = '';
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/cargar',
        data: {ciuCodigo: localStorage.ciudadInicio, categoria: localStorage.categoriaEmpresa},
        method: "post",
        beforeSend: function () {
            //
            app.preloader.show();
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            if (data.length > 0) {
                //
                for (var i = 0; i < data.length; i++) {
                    //
                    campos += '<li>';
                    campos += '<a onclick="codCatalogo(' + data[i]['cod'] + ')" href="/catalogo/" class="item-link item-content">';
                    //
                    if (data[i]['imagen'] !== '') {
                        //
                        campos += '<div class="item-media"><img src="' + urlImagenEmpresa + data[i]['imagen'] + '" width="65" height="65"/></div>';
                    } else {
                        //
                        campos += '<div class="item-media"><img src="img/empresa.png" width="65"/></div>';
                    }
                    //
                    campos += '<div class="item-inner">';
                    campos += '<div class="item-title-row">';
                    campos += '<div class="item-title" style="color: white;">' + data[i]['nombre'] + '</div>';
                    campos += '</div>';
                    campos += '<div class="item-subtitle"><p style="color: white; margin: 0px;">' + data[i]['descripcion'] + '</p><p style="color: white; margin: 0px;">' + data[i]['estado'] + '</p></div>';
                    campos += '</div></a></li>';
                }
                //
            } else {
                //
                campos = '<li style="text-align: center;"><h3 style="color: white;">No hay empresas en la categoria seleccionada</h3></li>';
            }
        },
        error: function (xhr) {
            console.log(xhr);
        },
        complete: function () {
            //
            setTimeout(function () {
                //
                $$('#empresasHome').html(campos);
                app.preloader.hide();
            }, 500);
        }
    });
}

//
function subscribirse() {
    //
    cordova.plugins.CordovaMqTTPlugin.subscribe({
        topic: 'appNotificacionesLT/notificaciones',
        qos: 0,
        success: function (s) {
            //
            cordova.plugins.CordovaMqTTPlugin.listen("appNotificacionesLT/notificaciones", function (payload, params) {
                //
                if (payload !== '' && payload !== null && payload !== undefined) {
                    //
//                    alert(payload);
                    cordova.plugins.notification.local.schedule({
                        title: 'Alerta',
                        text: payload,
                        foreground: true,
//                        smallIcon: 'res://calendar',
                        icon: 'img/logo.png'
                    });
                }
            });
        },
        error: function (e) {
            //alert("err!! something is wrong. check the console")
        }
    });
}