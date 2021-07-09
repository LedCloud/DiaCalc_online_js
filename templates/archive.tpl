{* Smarty *} 
{include file='header.tpl'}
<link rel="stylesheet" href="css/archive.css?22102018">
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?01102018"></script>
<script src="js/archive.js?01112018"></script>

</head>
<body oncontextmenu="return false;">
<div data-role="page" id="page_archive"  class="page-swipe">
    <div data-role="panel" id="miscPanel" data-display="overlay"> 
        <h3>Дополнительно</h3>
        <div data-role="controlgroup">
        <a href="index.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Расчёт</a>    
        <a href="diary.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Дневник</a>
        <a href="coefs.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Коэффициенты</a>
        <a href="groupsmgr.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Группы</a>
        <a href="calcs.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Пересчёты</a>
        </div>
        <div data-role="controlgroup">
        <a href="settings.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Настройки</a>
        <a href="changepass.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Изменить пароль</a>
        </div>
        <a href="?desktop&{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Полная версия</a>
        <hr>
        <a href="?exit&{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Выйти</a>
    </div>
    <div data-role="header" data-position="fixed" id="prodHeader">
        <a href="#miscPanel" class="ui-btn ui-btn-left ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left ui-btn-icon-notext">Дополнительно</a>
        <h3 id="product-header" style="margin: 0 70% 0 7%">Архив</h3>
        <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">
        <select  id="select-arc-group">
            {if $arc_groups}
                {foreach from=$arc_groups item=gr}
                   <option value="{$gr.id}">{$gr.name}</option>
                {/foreach}
            {/if}
        </select>
        </div>
        <div data-role="navbar" id="navSearch">
            <form class="ui-filterable" id="searchForm">
                <input id="filterProduct" data-type="search">
            </form>
        </div>
    </div>
    <div data-role="main" class="ui-content">
        <ul data-role="listview" id="prlist" data-filter="true" data-input="#filterProduct">
            
        </ul>
    </div>
    {*Рисуем кнопку поиска*}
    <a href="#" class="ui-btn ui-icon-search ui-btn-icon-notext ui-corner-all"
       style="position: fixed; bottom:0;left:0; z-index: 100;"
       id="open-search-pane">No text</a>
    {*Попап поиска*}
    <div data-role="popup" id="searchPane" data-theme="a" class="ui-corner-all">
        <form class="ui-filterable">
            <div style="padding:10px 20px;">
                {*<h3>Введите строку поиска</h3>*}
                <input data-type="search" name="base-search" id="base-search" 
                       value="" placeholder="Поиск">
                <ul data-role="listview" id="search-result" data-inset="true" 
                    data-filter="true" data-input="#base-search">
                </ul>
            </div>
        </form>
    </div>
    {*Диалог ввода продукта*}
    <div data-role="popup" id="contextProdMenu" data-theme="a" class="ui-corner-all">
        <div style="padding:10px 20px;">
            <h3>Добавить продукт в базу</h3>
            <p id="ctx-name"></p>
            <p>Б: <span id="ctx-dlg-prot" class="bigger"></span> 
               Ж: <span id="ctx-dlg-fat" class="bigger"></span> 
               У: <span id="ctx-dlg-carb" class="bigger"></span> 
               ГИ: <span id="ctx-dlg-gi" class="bigger"></span></p>
            {*Сюда вставляем селект, который заполняем из php*}
            <label for="popup-group-choice">Выбор группы</label>
            <select name="popup-group-choice" id="popup-group-choice" data-disable-page-zoom="false" data-native-menu="false">
            {if $groups}
                {foreach from=$groups item=gr}
                    {if $gr.id!=0}
                    <option value="{$gr.id}">{$gr.name}</option>
                    {/if}
                {/foreach}
            {/if}
            </select>
            <a href="#" id="popup-pr-cancel" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" id="popup-pr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-transition="flow">Добавить</a>
        </div>
    </div>
    {*popup successfully product added to base*}
    <div data-role="popup" id="message-alert">
        <p>Продукт добавлен в рабочую базу!</p>
    </div>
</div>