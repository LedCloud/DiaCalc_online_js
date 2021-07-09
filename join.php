<?php
define('IN_DCONLINE', true);
include_once 'inc/module.php';

$auth = new auth(); //~ Создаем новый объект класса

//~ Проверка авторизации
if ($auth->check()){ //Если мы заавторизированы, то переплевываем на index.php
    header('Location: index.php?'.htmlspecialchars(SID));
    exit;
}

//Иначе грузим шаблон и показываем его
require_once( 'libs/Smarty.class.php');
$smarty = new Smarty();
$smarty->assign('sid',htmlspecialchars(SID));

include_once 'inc/functions.php';

if (isset($_POST['send'])) {//Нажали кнопку регистрация
    //Пробуем зарегистрировать, если успешно, то шлём на login
    //Иначе показываем ошибки
    $login = trim($_POST['login']);
    $email1 = trim($_POST['email1']);
    $email2 = trim($_POST['email2']);
    
    //Тут надо сделать POST гуглу
    /*$response=file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=6LcVYiMUAAAAAB3x0kgl7nXlVxe54BcSnV7clAJp&response=".
            $_POST['g-recaptcha-response']."&remoteip=".$_SERVER['REMOTE_ADDR']);
    $obj = json_decode($response);
    if(!$obj->success == true)
    {
        $error[] = 'Неверный код подтверждения.';
    }*/
    
    if (!isset($error)){
        //Код нормальный, пробуем дальше
        $res = $auth->registerNewUser($login, $email1, $email2);
        if ($res!='good'){
            $error = $res;
        }
    }
    if (!isset($error)){
        if ($auth->useMobile()){
            $smarty->display('greetings.tpl');
        }else{
            $smarty->display('greetings_d.tpl');
        }
        exit;
        
    }else{
        $smarty->assign('errors', $error );
    }
    
    $smarty->assign('login', $login);
    $smarty->assign('email1',$email1);

}

if ( $auth->useMobile() ) {
    $smarty->display('join.tpl');
}else{
    $smarty->display('join_d.tpl');
}
