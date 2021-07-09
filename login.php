<?php
define('IN_DCONLINE', true);
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
include_once 'inc/module.php';
require_once( 'libs/Smarty.class.php');

$smarty = new Smarty();
    
$auth = new auth(); //~ Создаем новый объект класса
//~ Авторизация
if (isset($_POST['send'])) {
    $res = $auth->authorization();
    if ($res!='good') {
        $error = $res;
    }
    
    $smarty->assign('login',@$_POST['login']);
}

if ($auth->check()){
    //Если авторизировались, то переходим на index.php
    header("Location: index.php?".htmlspecialchars(SID));
    exit();
}
else {
    //~ если есть ошибки выводим и предлагаем восстановить пароль
    // или еще не авторизировалис, то показываем форму для входа.
    if (isset($error)){
        $smarty->assign('errors', $error);
    }
    $smarty->assign('sid',htmlspecialchars(SID));
    if ( $auth->useMobile() ) {
        $smarty->display('login.tpl');
    }else{
        $smarty->display('login_d.tpl');
    }
}

