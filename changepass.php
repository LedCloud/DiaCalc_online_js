<?php
define('IN_DCONLINE', true);

include_once 'inc/module.php';

$auth = new auth();  //~ Создаем новый объект класса

if (!$auth->check()){//Мы не авторизованы
    header("Location: login.php?".htmlspecialchars(SID));
    exit;
}

require_once( 'libs/Smarty.class.php');

$smarty = new Smarty();
$smarty->assign('sid',htmlspecialchars(SID));

if (!isset($_POST['send'])){// и еще не нажали кнопку
    $smarty->assign('message','Смена пароля для пользователя - '.$_SESSION['login_user']);
}else{
    $res = $auth->changePassword($_POST['old_pass'], $_POST['passwd1'], $_POST['passwd2']);
   if ($res=='good'){
        $smarty->assign('success',true);
    } else{ //тут выводим ошибки
        $smarty->assign('errors', $res);
    } 
}
if ($auth->useMobile()){
    $smarty->display('ch_pass.tpl');
}else{
    $smarty->display('ch_pass_d.tpl');
}
