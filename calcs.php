<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define('IN_DCONLINE', true);
//DEFINE('DEBUG',true);

include_once 'inc/module.php';

$auth = new auth(); //~ Создаем новый объект класса

//~ выход
if (isset($_GET['exit'])){
    $auth->exit_user();
    header('Location: login.php?'.htmlspecialchars(SID));
    exit;
}

//~ Проверка авторизации
if (!$auth->check()){
    header('Location: login.php?'.htmlspecialchars(SID));
    exit();
}

require_once( 'libs/Smarty.class.php');
include_once 'inc/functions.php';

$user_id = $_SESSION['id_user'];
$be = $auth->getBE($user_id);
$settings = $auth->getSettings($user_id);

$smarty = new Smarty();
$smarty->assign('sid',htmlspecialchars(SID));
$smarty->assign('be',$be);
$smarty->assign('weight',$settings['weight']);

$smarty->display('calcs.tpl');
