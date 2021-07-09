<?php
define('IN_DCONLINE', true);

include_once 'inc/module.php';
require_once( 'libs/Smarty.class.php');

$smarty = new Smarty();

$auth = new auth();  //~ Создаем новый объект класса

if ($auth->check()){
    //Если авторизировались, то переходим на index.php
    header("Location: index.php?".htmlspecialchars(SID));
    exit();
}
$smarty->assign('sid',htmlspecialchars(SID));

if (isset($_POST['send'])) {
    $smarty->assign('login',$_POST['login']);

    //~ запрос на восстановление пароля
    $reply = $auth->recovery_pass($_POST['login'], $_POST['mail']);
    if ($reply=='good') {
        //~ положительный ответ
        $smarty->assign('success',true);
    } else {
        //~ ошибка во время восстановления
        $smarty->assign('errors',$reply);
    }
}
if ( $auth->useMobile() ) {
    $smarty->display('recovery.tpl');
}else{
    $smarty->display('recovery_d.tpl');
}
