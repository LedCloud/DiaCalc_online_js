{* Smarty *} 
{include file='header.tpl'}
<link rel="stylesheet" href="css/main.css?22102018">
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?10032021"></script>
<script src="js/main.js?10032021"></script>
<script>
    var settings ={ldelim}
        menuinfo: {$settings.menuinfo},
        roundto : {$settings.roundto},
        whole   : {$settings.whole},
        mmol    : {$settings.mmol},
        filteroff:{$settings.filteroff},
        timedcoefs:{$settings.timedcoefs},
        calorlimit:{$settings.calorlimit},
        eaten   :{$settings.eaten},
        eatenDt :new Date('{$settings.eatendate}')
    {rdelim}; 
    {if $coefs}
    var coefsArr = [ 
        {foreach from=$coefs item=cf}
            {ldelim} time: "{$cf.time}",
                     k1  : {$cf.k1},
                     k2  : {$cf.k2},
                     k3  : {$cf.k3}
            {rdelim},
        {/foreach} ];
        
    {/if}
    var target = new Sugar({$settings.shtarget});
</script>
</head>
<body oncontextmenu="return false;">

<div data-role="page" id="page_menu"  class="page-swipe">
    <div data-role="panel" id="miscPanel" data-display="overlay"> 
        <h3>Дополнительно</h3>
        <div data-role="controlgroup">
        <a href="diary.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Дневник</a>
        <a href="coefs.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Коэффициенты</a>
        <a href="groupsmgr.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Группы</a>
        <a href="archive.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Архив</a>
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
    <div data-role="header" data-position="fixed">
        <a href="#miscPanel" class="ui-btn ui-btn-left ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left ui-btn-icon-notext">Дополнительно</a>
        <h3 class='show-dose-info'>Меню</h3>
        <p class='center-p show-dose-info' id='results'><sub>БД</sub><strong><span class='dose-quick'></span></strong> + <sub>МД</sub>
            <strong><span class='dose-slow'></span></strong> = <sub>Σ</sub><strong><span class='dose-whole'></span></strong> <sub>Калор</sub>
            <strong><span class='info-calor'></span></strong>
        </p>
        <a href="#page_prods" data-transition="slide" data-icon="arrow-r">Продукты</a>
    </div>
    <div data-role="main" class="ui-content">
        <ul data-role="listview" id="menulist">
            {*<li data-icon="delete">
		<a href="#" class="list2">
		<h6>Мясо готовое</h6>
		<p>Б - 50 Ж - 38 У - 18 ГИ 48</p>
                <input type="number" name="weight" id="weight1" data-wrapper-class="weightfield" placeholder="Вес">
                </a>
                <a href="#">Удалить</a>
	    </li>*}
        </ul>
    </div>
    <div data-role="footer" data-position="fixed">
        <div data-role="navbar"  data-iconpos="left">
            <ul>
                <li>
                    <button id="coefs-btn" data-icon="check" class="ui-shadow">
                        k1=<span id='coef-info-k1'></span> k2=<span id='coef-info-k2'></span> ЦЕИ=<span id='coef-info-k3'></span> ХЕ=<span id='coef-info-be'></span><br>
                        СК1-<span id='coef-info-sh1'></span> СК2-<span id='coef-info-sh2'></span>
                    </button></li>
            </ul>
        </div>
    </div>
    {*popup с расшифровкой доз*}
    <div data-role="popup" id="popupDoses" class="ui-content" data-arrow="true" style="min-width:210px;">
        <h5>Расшифровка дозы</h5>
        <table width="100%">
            <thead><tr><th>БД</th><th>МД</th><th>Σ</th></tr>
            </thead>
            <tbody>
                <tr><td align='center'><strong><span class='dose-quick'></span></strong></td><td align='center'><strong><span class='dose-slow'></span></strong></td>
                    <td rowspan="3" bgcolor="#FBF0DB" align='center'><strong><span class='dose-whole'></span></strong></td>
                </tr><tr><td align='center'>(<sub>ДПС</sub><strong><span class="dose-dps"></span></strong> + <sub>БДугл</sub><strong><span id="dose-carb-q"></span></strong>)</td>
                    <td align='center'>(<sub>МДугл</sub><strong><span id="dose-carb-sl"></span></strong> + <sub>МДбж</sub><strong><span class="dose-protfat"></span></strong>)</td>
                </tr><tr><td align='center'>(<sub>ДПС</sub><strong><span class="dose-dps"></span></strong> + <sub>УГЛ</sub><strong><span id="dose-carb"></span></strong>)</td>
                    <td align='center'>(<sub>БЖ</sub><strong><span class="dose-protfat"></span></strong>)</td></tr>
            </tbody>
        </table>
        <hr>
        {*<h5>БЖУ ГИ и калории</h5>*}
        <table width="100%">
            <thead><tr><th>Б</th><th>Ж</th><th>У</th><th>ХЕ</th><th>ГИ</th><th>ГН</th><th>Калор</th>
                </tr>
            </thead>
            <tbody><tr><td align='center'><strong><span id='info-prot'></span></strong></td>
                    <td align='center'><strong><span id='info-fat'></span></strong></td>
                    <td align='center'><strong><span id='info-carb'></span></strong></td>
                    <td align='center'><strong><span id='info-be-amount'></span></strong></td>
                    <td align='center'><strong><span id='info-gi'></span></strong></td>
                    <td align='center'><strong><span id='info-gn'></span></strong></td>
                    <td align='center'><strong><span class='info-calor'></span></strong></td></tr></tbody>
        </table>
        {if $settings.calorlimit>0}
        <hr>
        <h5>Калории</h5>
        <table width="100%">
            <tr>
                <td>Съедено+Меню: <strong><span id="calor-eaten"></span></strong></td>
                <td>Лимит: <strong>{$settings.calorlimit}</strong></td>
            </tr>
        </table>
        {/if}
    </div>
    {*Диалог коэф-ов*}
    <div data-role="popup" id="popupCoefs" data-theme="a" class="ui-corner-all">
        <div style="padding:10px 20px;">
            <h3>Коэффициенты</h3>
            <div class="dispInlineLabel"><label for="coefK1">k1:</label></div>
            <div class="dispInline"><input type="number" name="coefK1" id="coefK1" placeholder="k1" data-theme="a" class="coefs-input"></div>
            <!-- Clear floats for each new line -->
            <div class="clearFloats"></div>
        
            <div class="dispInlineLabel"><label for="coefK2" >k2:</label></div>
            <div class="dispInline"><input type="number" name="coefK2" id="coefK2" placeholder="k2" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            <div class="dispInlineLabel"><label for="coefK3">ЦЕИ:</label></div>
            <div class="dispInline"><input type="number" name="coefK3" id="coefK3" placeholder="ЦЕИ" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            <div class="dispInlineLabel"><label for="coefSH1">СКстарт:</label></div>
            <div class="dispInline"><input type="number" name="coefSH1" id="coefSH1" placeholder="СК старт" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            <div class="dispInlineLabel"><label for="coefSH2">СКцель:</label></div>
            <div class="dispInline"><input type="number" name="coefSH2" id="coefSH2" placeholder="СК цель" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            <div class="dispInlineLabel"><label for="coefBE">ХЕ:</label></div>
            <div class="dispInline"><input type="number" name="coefBE" id="coefBE" placeholder="ХЕ" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            {if $coefs}
            <!--select с коэф-ми -->
            <select name="coefs-popup-coefs-choice" id="coefs-popup-coefs-choice" 
                    data-disable-page-zoom="false" data-native-menu="false">
                {if $settings.timedcoefs}
                    {for $i=0 to 23}
                        <option value="{$i}">{if $i<10}0{/if}{$i}:00 k1={$coefs[$i].k1} k2={$coefs[$i].k2} ЦЕИ={$coefs[$i].k3}</option>
                    {/for}
                {else}
                    {for $i=1 to count($coefs)}
                        <option value="{$i-1}">k1={$coefs[$i-1].k1} k2={$coefs[$i-1].k2} ЦЕИ={$coefs[$i-1].k3}</option>
                    {/for}
                {/if}
            </select>
            {/if}
            <a href="#" id="popup-coef-cancel" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" id="popup-coef-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Ввод</a>
        </div>
    </div>{*Конец диалога коэ-ов*}
    {*Контекстное меню для меню*}
    <div data-role="popup" id="contextMenuMenu" data-theme="a">
        <ul data-role="listview" data-inset="true" style="min-width:210px;">
            <li data-role="list-divider">Меню</li>
            <li><a href="#" id="flushMenu">Очистить меню</a></li>
            <li><a href="#" id="roundDose">Округлить дозу</a></li>
            <li><a href="#" id="createNewProd">Создать новый продукт из меню</a></li>
            <li><a href="#" id="store2diary">Сохранить меню в дневник</a></li>
        </ul>
    </div>
    {*Диалог округления*}
    <div data-role="popup" id="popup-round" data-theme="a" class="ui-corner-all">
        <div data-role="header" data-theme="a">
        <h1>Округление дозы</h1>
        </div>
        <div data-role="main" class="ui-content">
            {*<h3 class="ui-title">Удалить продукт?</h3>*}
            <p>Округлить дозу инсулина, изменив вес продукта:<br>
              <strong><span id="popup-round-prod-name"></span></strong></p>
            <p>К текущему весу продукта <span id="popup-round-weight-current"></span> гр.<br>
                нужно прибавить <span class="popup-round-add-text"></span> гр.<br>или отнять 
              <span class="popup-round-substruct-text"></span> гр.</p>
            {*<div data-role="controlgroup" data-type="horizontal">*}
            <a href="#" id="popup-round-btn-up" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" 
               data-rel="back">Прибавить: 
                <span class="popup-round-add-text"></span> гр.</a>
            <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-a" 
               data-rel="back">Отмена</a> 
            <a href="#" id="popup-round-btn-down" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" 
               data-rel="back">Отнять: 
                <span class="popup-round-substruct-text"></span> гр.</a>
            {*</div>*}
        </div>
    </div>
    {*Диалог сохранения в дневник*}
    <div data-role="popup" id="menu-save-to-diary" data-theme="a" class="ui-corner-all">
        <div style="padding:10px 20px;">
            <h3>Сохр. в дневник</h3>
            <legend>Дата, Время, Заметка</legend>
            <label for="menu-save-date" class="ui-hidden-accessible">Дата:</label>
            <input type="date" name="menu-save-date" id="menu-save-date">
            <label for="menu-save-time" class="ui-hidden-accessible">Время:</label>
            <input type="time" name="menu-save-time" id="menu-save-time">
            <label for="menu-save-remark" class="ui-hidden-accessible">Коммент:</label>
            <textarea name="menu-save-remark"  autofocus id="menu-save-remark"></textarea>
            
            <a href="#" id="menu-save-cancel" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" id="menu-save-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-transition="flow">Сохранить</a>
        </div>
    </div>
    {*Popup подтверждения сохранения и вообще для алертов?*}
    <div data-role="popup" id="popup-alert">
        <p id="popup-alert-message"></p>
    </div>
    {*Диалог создания нового продукта*}
    <div data-role="popup" id="menu-popupProduct" data-theme="a" class="ui-corner-all">
        <div style="padding:10px 20px;">
            <h3>Новый продукт</h3>
            <legend>Имя,Вес,БЖУ,ГИ</legend>
            <label for="menu-prodName" class="ui-hidden-accessible">Название:</label>
            <input type="text" name="menu-prodName" id="menu-prodName" placeholder="Название" data-theme="a">
            <label for="menu-prodWeight" class="ui-hidden-accessible">Вес:</label>
            <input type="tel" name="menu-prodWeight" id="menu-prodWeight" placeholder="Вес" data-theme="a">
            <label for="menu-prodProt" class="ui-hidden-accessible">Белки:</label>
            <input type="number" step="0.1" name="menu-prodProt" id="menu-prodProt" placeholder="Белки" data-theme="a">
            <label for="menu-prodFat" class="ui-hidden-accessible">Жиры:</label>
            <input type="number" step="0.1" name="menu-prodFat" id="menu-prodFat" placeholder="Жиры" data-theme="a">
            <label for="menu-prodCarb" class="ui-hidden-accessible">Угл.:</label>
            <input type="number" step="0.1" name="menu-prodCarb" id="menu-prodCarb" placeholder="Угл." data-theme="a">
            <label for="menu-prodGi" class="ui-hidden-accessible">ГИ:</label>
            <input type="number" step="1" name="menu-prodGi" id="menu-prodGi" placeholder="ГИ" data-theme="a">
            {*Сюда вставляем селект, который заполняем из php*}
            <select name="menu-popup-group-choice" id="menu-popup-group-choice" data-disable-page-zoom="false" data-native-menu="false">
            {if $groups}
                {foreach from=$groups item=gr}
                    {if $gr.id!=0}
                    <option value="{$gr.id}">{$gr.name}</option>
                    {/if}
                {/foreach}
            {/if}
            </select>
            <a href="#" id="menu-popup-pr-cancel" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" id="menu-popup-pr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-transition="flow">Сохранить</a>
        </div>
    </div>
</div>
<div data-role="page" id="page_prods" class="page-swipe">
    <div data-role="header" data-position="fixed" id="prodHeader">
        <a href="#page_menu" data-transition="slide" data-direction="reverse" data-icon="arrow-l">Меню</a>
        <h1 id="product-header" style="margin: 0 50% 0 15%">Продукты</h1>
        <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">
            <select name="group-choice" id="group-choice" data-disable-page-zoom="false">
                {if $groups}
                    {foreach from=$groups item=gr}
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
            {*<li data-icon="check">
		<a href="#" class="list1">
		<h6>Мясо готовое</h6>
		<p>Б - 50 Ж - 38 У - 18 ГИ 48</p>
		</a>
		<a href="#">Нажать для добавления в меню</a>
	    </li>
            <li data-icon="none">
		<a href="#" href="#" class="list1">
		<h6>Мясо по французки</h6>
                <p>Б - 50 Ж - 38 У - 18 ГИ 48</p>
		</a>
		<a href="#">Нажать для добавления в меню</a>
	    </li> *}
        </ul>
    </div>
    {*Рисуем кнопку поиска*}
    <a href="#" class="ui-btn ui-icon-search ui-btn-icon-notext ui-corner-all"
       style="position: fixed; bottom:0;left:0; z-index: 100;"
       id="open-search-pane">No text</a>
    
    {*<div data-role="footer" data-position="fixed" style="text-align:center;"> 
        <div data-role="navbar">
        <select name="group-choice" id="group-choice" data-disable-page-zoom="false">
            {if $groups}
                {foreach from=$groups item=gr}
                    <option value="{$gr.id}">{$gr.name}</option>
                {/foreach}
            {/if}
        </select>
        </div>
    </div>*}
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
    {*Контекстное меню продукта*}
    <div data-role="popup" id="contextProdMenu" data-theme="a">
        <ul data-role="listview" data-inset="true" style="min-width:210px;">
            <li data-role="list-divider">Продукт</li>
            <li><a href="#" id="addProd">Новый</a></li>
            <li><a href="#" id="editProd">Изменить</a></li>
            <li><a href="#" id="deleteProd">Удалить</a></li>
        </ul>
    </div>
    {*Диалог удаления Продукта*}
    <div data-role="popup" id="popupDelProd" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="max-width:400px;">
        <div data-role="header" data-theme="a">
        <h1>Удаление</h1>
        </div>
        <div data-role="main" class="ui-content">
            <h3 class="ui-title">Удалить продукт?</h3>
            <p id="pr-name"></p>
            <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" id="del-pr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Удалить</a>
        </div>
    </div>
    {*Диалог ввода продукта*}
    <div data-role="popup" id="popupProduct" data-theme="a" class="ui-corner-all">
        <div style="padding:10px 20px;">
            <h3>Новый продукт</h3>
            <label for="prodName" class="ui-hidden-accessible">Название:</label>
            <input type="text" name="prodName" id="prodName" placeholder="Название" data-theme="a">
            <label for="prodProt" class="ui-hidden-accessible">Белки:</label>
            <input type="number" step="0.1" name="prodProt" id="prodProt" placeholder="Белки" data-theme="a">
            <label for="prodFat" class="ui-hidden-accessible">Жиры:</label>
            <input type="number" step="0.1" name="prodFat" id="prodFat" placeholder="Жиры" data-theme="a">
            <label for="prodCarb" class="ui-hidden-accessible">Угл.:</label>
            <input type="number" step="0.1" name="prodCarb" id="prodCarb" placeholder="Угл." data-theme="a">
            <label for="prodGi" class="ui-hidden-accessible">ГИ:</label>
            <input type="number" step="1" name="prodGi" id="prodGi" placeholder="ГИ" data-theme="a">
            {*Сюда вставляем селект, который заполняем из php*}
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
            <a href="#" id="popup-pr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-transition="flow">Сохранить</a>
        </div>
    </div>
</div>
  
{include file='footer.tpl'}
