<?php
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

if ( isset($_GET['mobile']) ){
    $auth->setUseMobile(true);
    header('Location: archive.php?'.htmlspecialchars(SID));
    exit();
}
if (isset($_GET['desktop'])){
    $auth->setUseMobile(false);
    header('Location: archive.php?'.htmlspecialchars(SID));
    exit();
}

require_once( 'libs/Smarty.class.php');
include_once 'inc/functions.php';

$smarty = new Smarty();
$smarty->assign('sid',htmlspecialchars(SID));

$user_id = $_SESSION['id_user'];

/*$settings = $auth->getSettings($user_id);

$smarty->assign('settings',$settings);*/

$smarty->assign('arc_groups',$auth->getArchiveGroups());
$smarty->assign('groups',$auth->getGroups($user_id, array('usefreq'=>false)));


if ($auth->useMobile()){
    $smarty->display('archive.tpl');
}else{
    $smarty->display('archive_d.tpl');
}