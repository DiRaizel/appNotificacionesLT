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
                    $$('#nombres').val(localStorage.nombres);
                    $$('#apellidos').val(localStorage.apellidos);
                }
            }
        },
        {
            path: '/encuesta2/',
            url: 'encuesta2.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                    setTimeout(function () {
                        //
                        $$('#documento').val(arrayFamiliares[posFam]['documento']);
                        $$('#nombres').val(arrayFamiliares[posFam]['nombres']);
                        $$('#apellidos').val(arrayFamiliares[posFam]['apellidos']);
                    }, 500);
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
                    cargarFamiliares();
                }
            }
        },
        {
            path: '/familia/',
            url: 'familia.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                    cargarFamiliares();
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
var urlServidor = '';

//
document.addEventListener('deviceready', function () {
    //
    setTimeout("show5()", 1000);
    //
    if (localStorage.ipServidor === undefined) {
        //
        app.dialog.prompt('Ej: https://miservidor.com/', 'Url Servidor', function (url) {
            //
            localStorage.ipServidor = url;
            urlServidor = url;
        });
        //
        $$('.dialog-input').focus();
    } else {
        //
        urlServidor = localStorage.ipServidor;
    }
    //
    if (localStorage.idUsu !== undefined) {
        //
        if (localStorage.rol === 'usuario') {
            //
            if (localStorage.subscrito === 'subscrito') {
                //
                desubscribirse(localStorage.nombreEmpresa);
            }
            //
            $$('#btnHomeMenu').css('display', 'none');
            $$('#btnFamiliaMenu').css('display', 'none');
            $$('#btnHome2Menu').css('display', '');
            app.views.main.router.navigate('/home2/');
        } else {
            //
            $$('#btnHomeMenu').css('display', '');
            $$('#btnFamiliaMenu').css('display', '');
            $$('#btnHome2Menu').css('display', 'none');
            app.views.main.router.navigate('/home/');
        }
        //
        conectarMqtt(localStorage.idUsu, localStorage.nombreEmpresa);
    } else {
        //
        $$('#btnHomeMenu').css('display', 'none');
        $$('#btnHome2Menu').css('display', 'none');
        $$('#btnFamiliaMenu').css('display', 'none');
        $$('#btnCerrarSesionMenu').css('display', 'none');
    }
    //
    cordova.plugins.notification.local.setDefaults({
        led: {color: '#FFFFFF', on: 500, off: 500},
        vibrate: true
    });
    //
    if (localStorage.sdoPlano === undefined) {
        //
        window.plugins.insomnia.keepAwake();
        localStorage.sdoPlano = '2doPlano';
    }
}, false);

//
function editarIpServidor() {
    //
    app.dialog.prompt('Ej: https://miservidor.com/', 'Url Servidor', function (url) {
        //
        localStorage.ipServidor = url;
        urlServidor = url;
    });
    //
    $$('.dialog-input').focus();
}

//
function conectarMqtt(valor, valor2) {
    //
    cordova.plugins.CordovaMqTTPlugin.connect({
        url: 'tcp://165.227.89.32', //a public broker used for testing purposes only. Try using a self hosted broker for production.
        port: '1883',
        clientId: 'com.appNotificacionesLT' + valor,
        willTopicConfig: {
            qos: 0, //default is 0
            retain: false, //default is true
            topic: "appNotificacionesLT/notificaciones" + valor2,
            payload: ""
        },
        username: "fabian",
        password: '1234',
        success: function (s) {
            //
            if (localStorage.subscrito === 'subscrito' || subs === 'subscrito') {
                //
                subscribirse(valor2);
            }
        },
        error: function (e) {
//            console.log('error: ' + e);
        },
        onConnectionLost: function (e) {
//            console.log('conexion perdida: ' + e);
        }
    });
}

//
function subscribirse(valor) {
    //
    cordova.plugins.CordovaMqTTPlugin.subscribe({
        topic: 'appNotificacionesLT/notificaciones' + valor,
        qos: 0,
        success: function (s) {
            //
            cordova.plugins.CordovaMqTTPlugin.listen("appNotificacionesLT/notificaciones" + valor, function (payload, params) {
                //
                if (payload !== '' && payload !== null && payload !== undefined) {
                    //
                    cordova.plugins.notification.local.schedule({
                        title: 'Atención!',
                        text: 'Personal con temperatura elevada de ' + payload,
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

//
function desubscribirse(valor) {
    //
    cordova.plugins.CordovaMqTTPlugin.unsubscribe({
        topic: 'appNotificacionesLT/notificaciones' + valor,
        success: function (s) {
            //
        },
        error: function (e) {
            //
        }
    });
}

//----------------------------------Login---------------------------------------

//
var subs = '';

//
function login() {
    //
//    let formData = new FormData($$("#formLogin")[0]);
    var formElement = document.getElementById("formLogin");
    formData = new FormData(formElement);
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/login',
        data: formData,
        method: "POST",
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
                localStorage.nombres = data.nombres;
                localStorage.apellidos = data.apellidos;
                localStorage.rol = data.rol;
                localStorage.empresa = data.idEmp;
                localStorage.nombreEmpresa = data.empresa;
                //
                if (data.estadoP === 'Recuperando') {
                    //
                    app.preloader.hide();
                    //
                    app.dialog.prompt('Ingresa nueva contraseña', 'Atención!', function (pass) {
                        //
                        app.request({
                            url: urlServidor + 'appNotificacionesLTPhp/Update/actualizarPass',
                            data: {pass: pass, idUsu: data.idUsu},
                            method: "post",
                            beforeSend: function () {
                                //
                                app.preloader.show();
                            },
                            success: function (rsp2) {
                                //
                                if (rsp2 === 'Actualizada') {
                                    //
                                    if (data.rol === 'usuario') {
                                        //
                                        $$('#btnHomeMenu').css('display', 'none');
                                        $$('#btnFamiliaMenu').css('display', 'none');
                                        $$('#btnHome2Menu').css('display', '');
                                        $$('#btnCerrarSesionMenu').css('display', '');
                                    } else {
                                        //
                                        localStorage.subscrito = 'subscrito';
                                        subs = 'subscrito';
                                        //
                                        $$('#btnHomeMenu').css('display', '');
                                        $$('#btnFamiliaMenu').css('display', '');
                                        $$('#btnHome2Menu').css('display', 'none');
                                        $$('#btnCerrarSesionMenu').css('display', '');
                                    }
                                    //
                                    conectarMqtt(localStorage.idUsu, localStorage.nombreEmpresa);
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
                                } else {
                                    //
                                    app.preloader.hide();
                                    modal = app.dialog.create({
                                        title: 'Atención!',
                                        text: 'Error al actualizar la contraseña!',
                                        buttons: [{text: 'OK'}]
                                    }).open();
                                }
                            },
                            error: function (xhr) {
                                console.log(xhr);
                                app.preloader.hide();
                                modal = app.dialog.create({
                                    title: 'Atención!',
                                    text: 'Error de conexión!',
                                    buttons: [{text: 'OK'}]
                                }).open();
                            },
                            complete: function () {
                                //
                            }
                        });
                    });
                } else {
                    //
                    if (data.rol === 'usuario') {
                        //
                        $$('#btnHomeMenu').css('display', 'none');
                        $$('#btnFamiliaMenu').css('display', 'none');
                        $$('#btnHome2Menu').css('display', '');
                        $$('#btnCerrarSesionMenu').css('display', '');
                    } else {
                        //
                        localStorage.subscrito = 'subscrito';
                        subs = 'subscrito';
                        //
                        $$('#btnHomeMenu').css('display', '');
                        $$('#btnFamiliaMenu').css('display', '');
                        $$('#btnHome2Menu').css('display', 'none');
                        $$('#btnCerrarSesionMenu').css('display', '');
                    }
                    //
                    conectarMqtt(localStorage.idUsu, localStorage.nombreEmpresa);
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
                }
            } else {
                //
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'El correo ingresado no se encuentra registrado o la contraseña es incorrecta.',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        },
        error: function (xhr, e) {
            app.preloader.hide();
            console.log(xhr);
//            alert(JSON.stringify(xhr) + ' _ ' + JSON.stringify(e) + ' ' + $$('#correo').val() + ' - ' + $$('#password').val());
            modal = app.dialog.create({
                title: 'Atención!',
                text: 'Error de conexión!',
                buttons: [{text: 'OK'}]
            }).open();
        }
    });
}

//
function cerrarSesion() {
    //
    delete localStorage.idUsu;
    delete localStorage.cedula;
    delete localStorage.rol;
    delete localStorage.empresa;
    //
    if (localStorage.subscrito === 'subscrito') {
        //
        desubscribirse(localStorage.nombreEmpresa);
        localStorage.subscrito = 'desubscrito';
    }
    //
    delete localStorage.nombreEmpresa;
    //
    $$('#btnHomeMenu').css('display', 'none');
    $$('#btnHome2Menu').css('display', 'none');
    $$('#btnFamiliaMenu').css('display', 'none');
    $$('#btnCerrarSesionMenu').css('display', 'none');
    //
    app.views.main.router.navigate('/login/');
}

//
function recuperarPass() {
    //
    app.dialog.prompt('Ingresa el correo', 'Atención!', function (correo) {
        //
        app.request({
            url: urlServidor + 'appNotificacionesLTPhp/Read/recuperarPass',
            data: {correo: correo},
            method: "POST",
            beforeSend: function () {
                //
                app.preloader.show();
            },
            success: function (rsp) {
                //
                app.preloader.hide();
                //
                if (rsp == 'Enviado') {
                    //
                    app.preloader.hide();
                    //
                    modal = app.dialog.create({
                        title: 'Atención!',
                        text: 'La contraseña ha sido enviada al correo ingresado!',
                        buttons: [{text: 'OK'}]
                    }).open();
                } else {
                    //
                    modal = app.dialog.create({
                        title: 'Atención!',
                        text: 'El correo ingresado no se encuentra registrado!',
                        buttons: [{text: 'OK'}]
                    }).open();
                }
            },
            error: function (xhr, e) {
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'Error de conexión!',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        });
    });
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
                campos = '<li style="text-align: center; padding-top: 10px;"><h4 style="margin: 0px;">Encuestados el día de hoy</h4></li>';
                //
                for (var i = 0; i < data.length; i++) {
                    //
                    var colorRow = '';
                    //
                    if (data[i]['morbilidad'] === 'Si') {
                        //
                        colorRow = 'rowList2';
                    } else {
                        //
                        colorRow = 'rowList';
                    }
                    //
                    campos += '<li  class="' + colorRow + '">';
                    campos += '<div class="item-content">';
                    campos += '<div class="item-media"><img src="img/imgList.png" width="45"/></div>';
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
                campos = '<li style="text-align: center;"><h3>No hay encuestados el día de hoy</h3></li>';
            }
        },
        error: function (xhr) {
            console.log(xhr);
            app.preloader.hide();
            modal = app.dialog.create({
                title: 'Atención!',
                text: 'Error de conexión!',
                buttons: [{text: 'OK'}]
            }).open();
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
                campos1 = '<li style="text-align: center; padding-top: 10px;"><h4 style="margin: 0px;"><i class="fas fa-exclamation-triangle"></i> Atención!</h4></li>';
                //
                for (var i = 0; i < data.length; i++) {
                    //
                    campos1 += '<li class="rowListA">';
                    campos1 += '<div class="item-content">';
                    campos1 += '<div class="item-media"><img src="img/imgList.png" width="45"/></div>';
                    campos1 += '<div class="item-inner">';
                    campos1 += '<div class="item-title-row">';
                    campos1 += '<div class="item-title">' + data[i]['nombres'] + ' ' + data[i]['apellidos'] + '</div>';
                    campos1 += '</div>';
                    campos1 += '<div class="item-subtitle">' + data[i]['documento'] + ', ' + data[i]['descripcion'] + '</div>';
                    campos1 += '</div></div></li>';
                }
                //
            }
        },
        error: function (xhr) {
            console.log(xhr);
            app.preloader.hide();
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
    var campos = '';
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
                campos = '<li style="text-align: center;"><img src="img/encuestaR.png" style="width: 100%; border-radius: 5px;"/></li>';
                //
                validarSemaforo();
                //
            } else {
                //
                campos = '<li style="text-align: center;"><a href="/encuesta/" onclick="controlEncuesta(1)"><img src="img/encuesta.jpeg" style="width: 100%; border-radius: 5px;"/></a></li>';
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

//
var controlE = 0;

//
function controlEncuesta(valor) {
    //
    controlE = valor;
    //
    if (valor === 1) {
        //
        validarMorbilidad();
    } else {
        //
        validarMorbilidadF();
    }
}

//
function validarSemaforo() {
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/validarSemaforo',
        data: {empresa: localStorage.empresa, idUsu: localStorage.idUsu},
        method: "post",
        beforeSend: function () {
            //
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            var semaforo = '';
            //
            if (data[0].sql === 'verde') {
                //
                console.log('holas');
                semaforo = '<img src="img/semaforoV.png" style="width: 100%; height: 20vh;"/>';
            } else if (data[0].sql === 'naranja') {
                //
                semaforo = '<img src="img/semaforoN.png" style="width: 100%; height: 20vh;"/>';
            } else {
                //
                semaforo = '<img src="img/semaforoR.png" style="width: 100%; height: 20vh;"/>';
            }
            //
            $$('#semaforo').html(semaforo);
        },
        error: function (xhr) {
            console.log(xhr);
        },
        complete: function () {
            //
        }
    });
}

//----------------------------------Encuesta------------------------------------

//
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
            //
            deshabilitarNinguno();
            //
            fiebre = 1;
        }
    } else if (valor === 'tos') {
        //
        if (tos === 1) {
            tos = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            tos = 1;
        }
    } else if (valor === 'cefalea') {
        //
        if (cefalea === 1) {
            cefalea = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            cefalea = 1;
        }
    } else if (valor === 'dolorGarganta') {
        //
        if (dolorGarganta === 1) {
            dolorGarganta = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            dolorGarganta = 1;
        }
    } else if (valor === 'malestarGeneral') {
        //
        if (malestarGeneral === 1) {
            malestarGeneral = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            malestarGeneral = 1;
        }
    } else if (valor === 'dificultadRespiratoria') {
        //
        if (dificultadRespiratoria === 1) {
            dificultadRespiratoria = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            dificultadRespiratoria = 1;
        }
    } else if (valor === 'adinamia') {
        //
        if (adinamia === 1) {
            adinamia = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            adinamia = 1;
        }
    } else if (valor === 'secrecionesNasales') {
        //
        if (secrecionesNasales === 1) {
            secrecionesNasales = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            secrecionesNasales = 1;
        }
    } else if (valor === 'diarrea') {
        //
        if (diarrea === 1) {
            diarrea = 2;
        } else {
            //
            deshabilitarNinguno();
            //
            diarrea = 1;
        }
    } else if (valor === 'ninguno') {
        //
        if (ninguno === 1) {
            ninguno = 2;
        } else {
            //
            $$('[name="fiebre1"]').prop('checked', false);
            $$('[name="tos1"]').prop('checked', false);
            $$('[name="cefalea1"]').prop('checked', false);
            $$('[name="dolorGarganta1"]').prop('checked', false);
            $$('[name="malestarGeneral1"]').prop('checked', false);
            $$('[name="dificultadRespiratoria1"]').prop('checked', false);
            $$('[name="adinamia1"]').prop('checked', false);
            $$('[name="secrecionesNasales1"]').prop('checked', false);
            $$('[name="diarrea1"]').prop('checked', false);
            //
            fiebre = 2;
            tos = 2;
            cefalea = 2;
            dolorGarganta = 2;
            malestarGeneral = 2;
            dificultadRespiratoria = 2;
            adinamia = 2;
            secrecionesNasales = 2;
            diarrea = 2;
            //
            ninguno = 1;
        }
    }
}

//
function deshabilitarNinguno() {
    //
    if (ninguno === 1) {
        //
        $$('[name="ninguno1"]').prop('checked', false);
        ninguno = 2;
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
var controlG = false;

//
function validarMorbilidad() {
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/validarMorbilidad',
        data: {idUsu: localStorage.idUsu},
        method: "post",
        beforeSend: function () {
            //
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            if (data.estado == 'guardada') {
                //
                controlG = true;
            } else {
                //
                app.popup.open('.popup-antecedentes', true);
            }
        },
        error: function (xhr) {
            controlG = false;
            console.log(xhr);
        }
    });
}

//
function validarMorbilidadF() {
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/validarMorbilidadF',
        data: {idFam: arrayFamiliares[posFam]['idFam']},
        method: "post",
        beforeSend: function () {
            //
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            if (data.estado == 'guardada') {
                //
                controlG = true;
            } else {
                //
                app.popup.open('.popup-antecedentes', true);
            }
        },
        error: function (xhr) {
            controlG = false;
            console.log(xhr);
        }
    });
}

//
function guardarEncuesta() {
    //
    if (fiebre === 2 && tos === 2 && cefalea === 2 && dolorGarganta === 2 && malestarGeneral === 2 && dificultadRespiratoria === 2 && adinamia === 2 && secrecionesNasales === 2 && diarrea === 2 && ninguno === 2) {
        //
        modal = app.dialog.create({
            title: 'Atención!',
            text: 'Selecciona alguna opción en síntomas!',
            buttons: [{text: 'OK'}]
        }).open();
    } else {
        //
        if (controlG) {
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
            var funcion = '';
            //
            if (controlE == 1) {
                //
                funcion = 'guardarEncuesta';
            } else {
                //
                formData.append('idFam', arrayFamiliares[posFam]['idFam']);
                funcion = 'guardarEncuestaF';
            }
            //
            app.request({
                url: urlServidor + 'appNotificacionesLTPhp/Create/' + funcion,
                data: formData,
                method: "post",
                beforeSend: function () {
                    //
                    app.preloader.show();
                },
                success: function (rsp) {
                    //
                    controlG = false;
                    var data = JSON.parse(rsp);
                    //
                    if (data.estado == 'guardada') {
                        //
                        setTimeout(function () {
                            //
                            app.preloader.hide();
                            //
                            var temp = parseFloat($$('#temperatura').val());
                            //
                            modal = app.dialog.create({
                                title: 'Atención!',
                                text: 'Encuesta guardada!',
                                buttons: [{text: 'OK'}]
                            }).open();
                            //
                            if (localStorage.rol === 'usuario') {
                                //
                                if (temp > 37) {
                                    //
                                    enviarAlarma(temp);
                                }
                                //
                                app.views.main.router.navigate('/home2/');
                            } else {
                                //
                                if (funcion === 'guardarEncuestaF') {
                                    //
                                    app.views.main.router.navigate('/familia/');
                                } else {
                                    //
                                    app.views.main.router.navigate('/home/');
                                }
                            }
                        }, 500);
                    } else {
                        //
                        app.preloader.hide();
                        modal = app.dialog.create({
                            title: 'Atención!',
                            text: 'Error al guardar la encuesta!',
                            buttons: [{text: 'OK'}]
                        }).open();
                    }
                },
                error: function (xhr) {
                    controlG = false;
                    console.log(xhr);
                    app.preloader.hide();
                    modal = app.dialog.create({
                        title: 'Atención!',
                        text: 'Error de conexión!',
                        buttons: [{text: 'OK'}]
                    }).open();
                }
            });
            //
            fiebre = 2;
            tos = 2;
            cefalea = 2;
            dolorGarganta = 2;
            malestarGeneral = 2;
            dificultadRespiratoria = 2;
            adinamia = 2;
            secrecionesNasales = 2;
            diarrea = 2;
            ninguno = 2;
        }
    }
}

//
var controlMor = false;

//
function guardarMorbilidad(valor) {
    //
    if (ningunoA === 2 && fumador === 2 && desnutricion === 2 && sobrepeso === 2 && cancer === 2 && inmunodeficiencia === 2 && corticoides === 2 && enfermedadesAutoinmunes === 2 && otroProblemasPulmonares === 2 && hipotiroidismo === 2 && enfermedadPulmonar === 2 && fallaRenal === 2 && diabetes === 2 && hipertencion === 2 && enfermedadesCorazon === 2) {
        //
        modal = app.dialog.create({
            title: 'Atención!',
            text: 'Selecciona alguna opción!',
            buttons: [{text: 'OK'}]
        }).open();
    } else {
        //
        var funcion = '';
        //
        var formElement = document.getElementById("formAntecedentes");
        formData = new FormData(formElement);
        //
        formData.append('idUsu', localStorage.idUsu);
        formData.append('empresa', localStorage.empresa);
        //
        formData.append('diabetes', diabetes);
        formData.append('hipertencion', hipertencion);
        formData.append('enfermedadesCorazon', enfermedadesCorazon);
        formData.append('fallaRenal', fallaRenal);
        formData.append('enfermedadPulmonar', enfermedadPulmonar);
        formData.append('hipotiroidismo', hipotiroidismo);
        formData.append('otroProblemasPulmonares', otroProblemasPulmonares);
        formData.append('enfermedadesAutoinmunes', enfermedadesAutoinmunes);
        formData.append('corticoides', corticoides);
        formData.append('inmunodeficiencia', inmunodeficiencia);
        formData.append('cancer', cancer);
        formData.append('sobrepeso', sobrepeso);
        formData.append('desnutricion', desnutricion);
        formData.append('fumador', fumador);
        formData.append('ningunoA', ningunoA);
        //
        if (valor === 1) {
            //
            funcion = 'guardarMorbilidad';
        } else {
            //
            funcion = 'guardarMorbilidadF';
            formData.append('idFam', arrayFamiliares[posFam]['idFam']);
        }
        //
        app.request({
            url: urlServidor + 'appNotificacionesLTPhp/Create/' + funcion,
            data: formData,
            method: "post",
            beforeSend: function () {
                //
                app.preloader.show();
            },
            success: function (rsp) {
                //
                controlG = true;
                var data = JSON.parse(rsp);
                //
                if (data.estado == 'guardada') {
                    //
                    app.preloader.hide();
                    //
                    var toastBottom = app.toast.create({
                        text: 'Guardado!',
                        closeTimeout: 2000
                    });
                    //
                    toastBottom.open();
                    //
                    app.popup.close('.popup-antecedentes', true);
                } else {
                    //
                    app.preloader.hide();
                    modal = app.dialog.create({
                        title: 'Atención!',
                        text: 'Error al guardar!',
                        buttons: [{text: 'OK'}]
                    }).open();
                }
            },
            error: function (xhr) {
                controlG = false;
                console.log(xhr);
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'Error de conexión!',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        });
        //
        diabetes = 2;
        hipertencion = 2;
        enfermedadesCorazon = 2;
        fallaRenal = 2;
        enfermedadPulmonar = 2;
        hipotiroidismo = 2;
        otroProblemasPulmonares = 2;
        enfermedadesAutoinmunes = 2;
        corticoides = 2;
        inmunodeficiencia = 2;
        cancer = 2;
        sobrepeso = 2;
        desnutricion = 2;
        fumador = 2;
        ningunoA = 2;
    }
}

//
var diabetes = 2;
var hipertencion = 2;
var enfermedadesCorazon = 2;
var fallaRenal = 2;
var enfermedadPulmonar = 2;
var hipotiroidismo = 2;
var otroProblemasPulmonares = 2;
var enfermedadesAutoinmunes = 2;
var corticoides = 2;
var inmunodeficiencia = 2;
var cancer = 2;
var sobrepeso = 2;
var desnutricion = 2;
var fumador = 2;
var ningunoA = 2;

//
function activarCheckP(valor) {
    //
    if (valor === 'diabetes') {
        //
        if (diabetes === 1) {
            diabetes = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            diabetes = 1;
        }
    } else if (valor === 'hipertencion') {
        //
        if (hipertencion === 1) {
            hipertencion = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            hipertencion = 1;
        }
    } else if (valor === 'enfermedadesCorazon') {
        //
        if (enfermedadesCorazon === 1) {
            enfermedadesCorazon = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            enfermedadesCorazon = 1;
        }
    } else if (valor === 'fallaRenal') {
        //
        if (fallaRenal === 1) {
            fallaRenal = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            fallaRenal = 1;
        }
    } else if (valor === 'enfermedadPulmonar') {
        //
        if (enfermedadPulmonar === 1) {
            enfermedadPulmonar = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            enfermedadPulmonar = 1;
        }
    } else if (valor === 'hipotiroidismo') {
        //
        if (hipotiroidismo === 1) {
            hipotiroidismo = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            hipotiroidismo = 1;
        }
    } else if (valor === 'otroProblemasPulmonares') {
        //
        if (otroProblemasPulmonares === 1) {
            otroProblemasPulmonares = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            otroProblemasPulmonares = 1;
        }
    } else if (valor === 'enfermedadesAutoinmunes') {
        //
        if (enfermedadesAutoinmunes === 1) {
            enfermedadesAutoinmunes = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            enfermedadesAutoinmunes = 1;
        }
    } else if (valor === 'corticoides') {
        //
        if (corticoides === 1) {
            corticoides = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            corticoides = 1;
        }
    } else if (valor === 'inmunodeficiencia') {
        //
        if (inmunodeficiencia === 1) {
            inmunodeficiencia = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            inmunodeficiencia = 1;
        }
    } else if (valor === 'cancer') {
        //
        if (cancer === 1) {
            cancer = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            cancer = 1;
        }
    } else if (valor === 'sobrepeso') {
        //
        if (sobrepeso === 1) {
            sobrepeso = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            sobrepeso = 1;
        }
    } else if (valor === 'desnutricion') {
        //
        if (desnutricion === 1) {
            desnutricion = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            desnutricion = 1;
        }
    } else if (valor === 'fumador') {
        //
        if (fumador === 1) {
            fumador = 2;
        } else {
            //
            deshabilitarNingunoA();
            //
            fumador = 1;
        }
    } else if (valor === 'ningunoA') {
        //
        if (ningunoA === 1) {
            ningunoA = 2;
        } else {
            //
            $$('[name="diabetes1"]').prop('checked', false);
            $$('[name="hipertencion1"]').prop('checked', false);
            $$('[name="enfermedadesCorazon1"]').prop('checked', false);
            $$('[name="fallaRenal1"]').prop('checked', false);
            $$('[name="enfermedadPulmonar1"]').prop('checked', false);
            $$('[name="hipotiroidismo1"]').prop('checked', false);
            $$('[name="otroProblemasPulmonares1"]').prop('checked', false);
            $$('[name="enfermedadesAutoinmunes1"]').prop('checked', false);
            $$('[name="corticoides1"]').prop('checked', false);
            $$('[name="inmunodeficiencia1"]').prop('checked', false);
            $$('[name="cancer1"]').prop('checked', false);
            $$('[name="sobrepeso1"]').prop('checked', false);
            $$('[name="desnutricion1"]').prop('checked', false);
            $$('[name="fumador1"]').prop('checked', false);
            //
            diabetes = 2;
            hipertencion = 2;
            enfermedadesCorazon = 2;
            fallaRenal = 2;
            enfermedadPulmonar = 2;
            hipotiroidismo = 2;
            otroProblemasPulmonares = 2;
            enfermedadesAutoinmunes = 2;
            corticoides = 2;
            inmunodeficiencia = 2;
            cancer = 2;
            sobrepeso = 2;
            desnutricion = 2;
            fumador = 2;
            //
            ningunoA = 1;
        }
    }
}

//
function deshabilitarNingunoA() {
    //
    if (ningunoA === 1) {
        //
        $$('[name="ningunoA1"]').prop('checked', false);
        ningunoA = 2;
    }
}

//
function enviarAlarma(valor) {
    //
    cordova.plugins.CordovaMqTTPlugin.publish({
        topic: 'appNotificacionesLT/notificaciones',
        payload: String(valor),
        qos: 0,
        retain: false,
        success: function (s) {
            //
//            alert('Alarma enviada!');
        },
        error: function (e) {
            //alert("err!! something is wrong. check the console")
        }
    });
}

//--------------------------------Familia---------------------------------------

//
var arrayFamiliares = [];

//
function cargarFamiliares() {
    //
    var campos = '';
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Read/cargarFamiliares',
        data: {idUsu: localStorage.idUsu},
        method: "post",
        beforeSend: function () {
            //
            app.preloader.show();
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            arrayFamiliares = data;
            //
            if (data.length > 0) {
                //
                for (var i = 0; i < data.length; i++) {
                    //
                    var encuesta = '';
                    campos += '<li class="rowList">';
                    //
                    if (data[i]['encuesta'] === 'Si') {
                        //
                        campos += '<a href="#" class="item-link item-content" disabled>';
                        encuesta = 'Ya hizo encuesta el día de hoy';
                    } else {
                        //
                        campos += '<a onclick="cargarEncuestaFamiliar(' + i + ')" href="/encuesta2/" class="item-link item-content">';
                        encuesta = '';
                    }
                    //
                    campos += '<div class="item-media"><img src="img/imgList.png" width="45"/></div>';
                    campos += '<div class="item-inner">';
                    campos += '<div class="item-title-row">';
                    campos += '<div class="item-title">' + data[i]['nombres'] + ' ' + data[i]['apellidos'] + '</div>';
                    campos += '</div>';
                    campos += '<div class="item-subtitle">' + data[i]['documento'] + '</div>';
                    campos += '<div class="item-text">' + encuesta + '</div>';
                    campos += '</div></a></li>';
                }
            }
        },
        error: function (xhr) {
            console.log(xhr);
            app.preloader.hide();
            modal = app.dialog.create({
                title: 'Atención!',
                text: 'Error de conexión!',
                buttons: [{text: 'OK'}]
            }).open();
        },
        complete: function () {
            //
            setTimeout(function () {
                //
                $$('#familiares').html(campos);
                app.preloader.hide();
            }, 500);
        }
    });
}

//
var posFam = 0;

//
function cargarEncuestaFamiliar(valor) {
    //
    posFam = valor;
    controlE = 2;
    validarMorbilidadF();
}

//
function guardarFamiliar() {
    //
    var formElement = document.getElementById("formFamiliar");
    formData = new FormData(formElement);
    //
    formData.append('idUsu', localStorage.idUsu);
    formData.append('empresa', localStorage.empresa);
    //
    app.request({
        url: urlServidor + 'appNotificacionesLTPhp/Create/guardarFamiliar',
        data: formData,
        method: "post",
        beforeSend: function () {
            //
            app.preloader.show();
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            app.preloader.hide();
            //
            if (data.estado == 'guardado') {
                //
                cargarFamiliares();
                //
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'Familiar guardado!',
                    buttons: [{text: 'OK'}]
                }).open();
                //
                app.popup.close('.popupFamiliar', true);
                //
                $$('#formFamiliar')[0].reset();
                //
            } else if (data.estado === 'usuario') {
                //
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'Eres usuario principal, no puedes agregarte como familiar!',
                    buttons: [{text: 'OK'}]
                }).open();
            } else {
                //
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'Error al guardar la familiar!',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        },
        error: function (xhr) {
            controlG = false;
            console.log(xhr);
            app.preloader.hide();
            modal = app.dialog.create({
                title: 'Atención!',
                text: 'Error de conexión!',
                buttons: [{text: 'OK'}]
            }).open();
        }
    });
}