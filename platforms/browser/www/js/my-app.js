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
                    cargarEncuestados();
                    cargarAlertas();
                    validarEncuesta();
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
        },
        {
            path: '/encuesta/',
            url: 'encuesta.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                    $$('#documento').val(localStorage.cedula);
                }
            }
        },
        {
            path: '/encuestas/',
            url: 'encuestas.html',
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
            path: '/home2/',
            url: 'home2.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                    validarEncuesta();
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
    if (localStorage.idUsu === undefined) {
        //
        app.views.main.router.navigate('/login/');
    } else {
        //
        if (localStorage.rol === 'usuario') {
            //
            $$('#btnHomeMenu').css('display', 'none');
            $$('#btnHome2Menu').css('display', '');
            app.views.main.router.navigate('/home2/');
        } else {
            //
            $$('#btnHomeMenu').css('display', '');
            $$('#btnHome2Menu').css('display', 'none');
            app.views.main.router.navigate('/home/');
        }
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
                localStorage.cedula = data.cedula;
                localStorage.rol = data.rol;
                localStorage.empresa = data.empresa;
                //
                if (data.rol === 'usuario') {
                    //
                    $$('#btnHomeMenu').css('display', 'none');
                    $$('#btnHome2Menu').css('display', '');
                } else {
                    //
                    $$('#btnHomeMenu').css('display', '');
                    $$('#btnHome2Menu').css('display', 'none');
                }
                //
                setTimeout(function () {
                    //
                    app.preloader.hide();
                    //
                    if (data.rol === 'usuario') {
                        //
                        app.views.main.router.navigate('/home2/');
                    } else {
                        //
                        app.views.main.router.navigate('/home/');
                    }
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
function cargarEncuestados() {
    //
    var campos = '';
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/cargarEncuestados',
        data: {empresa: localStorage.empresa},
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
                campos = '<li style="text-align: center; padding-top: 10px;"><h4 style="margin: 0px;">Encuestados el dia de hoy</h4></li>';
                //
                for (var i = 0; i < data.length; i++) {
                    //
                    campos += '<li>';
                    campos += '<div class="item-content">';
                    campos += '<div class="item-media"><img src="img/user.png" width="45"/></div>';
                    campos += '<div class="item-inner">';
                    campos += '<div class="item-title-row">';
                    campos += '<div class="item-title">' + data[i]['nombres'] + ' ' + data[i]['apellidos'] + '</div>';
                    campos += '</div>';
                    campos += '<div class="item-subtitle">' + data[i]['documento'] + '</div>';
                    campos += '</div></div></li>';
                }
                //
            } else {
                //
                campos = '<li style="text-align: center;"><h3>No hay encuestados el dia de hoy</h3></li>';
            }
        },
        error: function (xhr) {
            console.log(xhr);
        },
        complete: function () {
            //
            setTimeout(function () {
                //
                $$('#encuestados').html(campos);
                app.preloader.hide();
            }, 500);
        }
    });
}

//
function cargarAlertas() {
    //
    var campos1 = '';
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/cargarAlertas',
        data: {empresa: localStorage.empresa},
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
                campos1 = '<li style="text-align: center; padding-top: 10px;"><h4 style="margin: 0px;">Alerta!</h4></li>';
                //
                for (var i = 0; i < data.length; i++) {
                    //
                    campos1 += '<li>';
                    campos1 += '<div class="item-content">';
                    campos1 += '<div class="item-media"><img src="img/user.png" width="45"/></div>';
                    campos1 += '<div class="item-inner">';
                    campos1 += '<div class="item-title-row">';
                    campos1 += '<div class="item-title">' + data[i]['nombres'] + ' ' + data[i]['apellidos'] + '</div>';
                    campos1 += '</div>';
                    campos1 += '<div class="item-subtitle">' + data[i]['documento'] + ', ' + data[i]['descripcion'] + '</div>';
                    campos1 += '</div></div></li>';
                }
                //
            } else {
                //
                campos1 = '<li style="text-align: center;"><h3>No hay encuestados el dia de hoy</h3></li>';
            }
        },
        error: function (xhr) {
            console.log(xhr);
        },
        complete: function () {
            //
            setTimeout(function () {
                //
                $$('#alertas').html(campos1);
                app.preloader.hide();
            }, 500);
        }
    });
}

//
function validarEncuesta() {
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/validarEncuesta',
        data: {empresa: localStorage.empresa, idUsu: localStorage.idUsu},
        method: "post",
        beforeSend: function () {
            //
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            if (data[0].sql === 'Si') {
                //
                campos = '<li style="text-align: center;"><h4 style="margin: 0px;">Ya hiciste la encuesta el dia de hoy</h4></li>';
                //
            } else {
                //
                campos = '<li style="text-align: center;"><a href="/encuesta/" class="button button-fill button-round">Hacer encuesta</a></li>';
            }
        },
        error: function (xhr) {
            console.log(xhr);
        },
        complete: function () {
            //
            setTimeout(function () {
                //
                $$('#encuesta').html(campos);
            }, 500);
        }
    });
}

//----------------------------------Encuesta------------------------------------

var fiebre = 2;
var tos = 2;
var cefalea = 2;
var dolorGarganta = 2;
var malestarGeneral = 2;
var dificultadRespiratoria = 2;
var adinamia = 2;
var secrecionesNasales = 2;
var diarrea = 2;
var ninguno = 2;

//
function activarCheck(valor) {
    //
    if (valor === 'fiebre') {
        //
        if (fiebre === 1) {
            fiebre = 2;
        } else {
            fiebre = 1;
        }
    } else if (valor === 'tos') {
        //
        if (tos === 1) {
            tos = 2;
        } else {
            tos = 1;
        }
    } else if (valor === 'cefalea') {
        //
        if (cefalea === 1) {
            cefalea = 2;
        } else {
            cefalea = 1;
        }
    } else if (valor === 'dolorGarganta') {
        //
        if (dolorGarganta === 1) {
            dolorGarganta = 2;
        } else {
            dolorGarganta = 1;
        }
    } else if (valor === 'malestarGeneral') {
        //
        if (malestarGeneral === 1) {
            malestarGeneral = 2;
        } else {
            malestarGeneral = 1;
        }
    } else if (valor === 'dificultadRespiratoria') {
        //
        if (dificultadRespiratoria === 1) {
            dificultadRespiratoria = 2;
        } else {
            dificultadRespiratoria = 1;
        }
    } else if (valor === 'adinamia') {
        //
        if (adinamia === 1) {
            adinamia = 2;
        } else {
            adinamia = 1;
        }
    } else if (valor === 'secrecionesNasales') {
        //
        if (secrecionesNasales === 1) {
            secrecionesNasales = 2;
        } else {
            secrecionesNasales = 1;
        }
    } else if (valor === 'diarrea') {
        //
        if (diarrea === 1) {
            diarrea = 2;
        } else {
            diarrea = 1;
        }
    } else if (valor === 'ninguno') {
        //
        if (ninguno === 1) {
            ninguno = 2;
        } else {
            ninguno = 1;
        }
    }
}

//
var pregunta1 = '';

//
function activarCheckP1(valor) {
    //
    pregunta1 = valor;
    //
    if (valor === 'Si') {
        //
        $$('[name="pregunta12"]').prop('checked', false);
    } else {
        //
        $$('[name="pregunta11"]').prop('checked', false);
    }
}

//
var pregunta2 = '';

//
function activarCheckP2(valor) {
    //
    pregunta2 = valor;
    //
    if (valor === 'Si') {
        //
        $$('[name="pregunta22"]').prop('checked', false);
    } else {
        //
        $$('[name="pregunta21"]').prop('checked', false);
    }
}

//
function guardarEncuesta() {
    //
    var formElement = document.getElementById("formEncuesta");
    formData = new FormData(formElement);
    //
    formData.append('idUsu', localStorage.idUsu);
    formData.append('empresa', localStorage.empresa);
    //
    formData.append('fiebre', fiebre);
    formData.append('tos', tos);
    formData.append('cefalea', cefalea);
    formData.append('dolorGarganta', dolorGarganta);
    formData.append('malestarGeneral', malestarGeneral);
    formData.append('dificultadRespiratoria', dificultadRespiratoria);
    formData.append('adinamia', adinamia);
    formData.append('secrecionesNasales', secrecionesNasales);
    formData.append('diarrea', diarrea);
    formData.append('ninguno', ninguno);
    //
    formData.append('pregunta1', pregunta1);
    formData.append('pregunta2', pregunta2);
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Create/guardarEncuesta',
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
            if (data.estado == 'guardada') {
                //
                setTimeout(function () {
                    //
                    app.preloader.hide();
                    //
                    modal = app.dialog.create({
                        title: 'Alerta!',
                        text: 'Encuesta guardada!',
                        buttons: [{text: 'OK'}]
                    }).open();
                    //
                    if (localStorage.rol === 'usuario') {
                        //
                        app.views.main.router.navigate('/home2/');
                    } else {
                        //
                        app.views.main.router.navigate('/home/');
                    }
                }, 500);
            } else {
                //
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Alerta!',
                    text: 'Error al guardar la encuesta!',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });
}