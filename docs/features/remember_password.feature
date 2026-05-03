Feature: Recordar Contraseña / Sesión
  Como investigador o técnico que usa la app frecuentemente
  Quiero que el sistema recuerde mi correo y contraseña (o mi sesión) entre aperturas de la app
  Para no tener que digitar mis credenciales manualmente cada vez que entro al laboratorio.

  Background:
    Given que estoy en la pantalla de inicio de sesión (/login) de Seymour OS

  Scenario: Seleccionar "Recordarme" guarda las credenciales en almacenamiento persistente nativo
    When introduzco mi correo "test@kronos.lab" y contraseña "segura123"
    And marco la casilla "Recordarme"
    And hago clic en "Ingresar"
    Then el inicio de sesión es exitoso
    And las credenciales se encriptan o guardan usando Capacitor Preferences para que sobrevivan a una actualización del APK

  Scenario: Autocompletar credenciales al abrir la app
    Given que previamente seleccioné "Recordarme" con mis credenciales
    When cierro y vuelvo a abrir la aplicación Seymour OS
    Then la pantalla de Login muestra mi correo "test@kronos.lab" autocompletado
    And la contraseña "segura123" está autocompletada
    And puedo hacer clic directamente en "Ingresar" sin escribir nada

  Scenario: Desmarcar "Recordarme" limpia el almacenamiento
    Given que la app tiene mis credenciales recordadas
    When desmarco la casilla "Recordarme"
    And hago clic en "Ingresar"
    Then el almacenamiento persistente de Capacitor elimina mis credenciales
