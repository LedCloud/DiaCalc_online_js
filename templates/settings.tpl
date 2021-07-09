{* Smarty *} 
{include file='header.tpl'}
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?18092018"></script>
<script src="js/settings.js?18092018"></script>
</head>
<body {*oncontextmenu="return false;"*}>

<div data-role="page" id="page_settings">
  <div data-role="header">
    <h1>Настройки программы</h1>
  </div>
<div data-role="tabs" id="tabs">
  <div data-role="navbar">
    <ul>
      <li><a href="#tab-menu" class="ui-btn-active" data-ajax="false">Меню</a></li>
      <li><a href="#tab-sh" data-ajax="false">СК</a></li>
      <li><a href="#tab-prod" data-ajax="false">Продукты</a></li>
    </ul>
  </div>
  <form method="post" action="settings.php?{$sid}" novalidate data-ajax="false">
  <div id="tab-menu" class="ui-body-d ui-content">
    <h4>Настройки меню</h4>
        <fieldset data-role="controlgroup">
            <legend>Информация в меню</legend>
            <input type="checkbox" name="menu-prot" id="menu-prot"
                   {if $settings.menuinfo&1}checked="checked"{/if}>
            <label for="menu-prot">Белки</label>
            
            <input type="checkbox" name="menu-fat" id="menu-fat"
                   {if $settings.menuinfo&2}checked="checked"{/if}>
            <label for="menu-fat">Жиры</label>
            
            <input type="checkbox" name="menu-carb" id="menu-carb"
                   {if $settings.menuinfo&4}checked="checked"{/if}>
            <label for="menu-carb">Углеводы</label>
            
            <input type="checkbox" name="menu-be" id="menu-be"
                   {if $settings.menuinfo&8}checked="checked"{/if}>
            <label for="menu-be">ХЕ</label>
            
            <input type="checkbox" name="menu-dose" id="menu-dose"
                   {if $settings.menuinfo&16}checked="checked"{/if}>
            <label for="menu-dose">Доза</label>
            
            <input type="checkbox" name="menu-gi" id="menu-gi"
                   {if $settings.menuinfo&32}checked="checked"{/if}>
            <label for="menu-gi">ГИ</label>
            
            <input type="checkbox" name="menu-gn" id="menu-gn"
                   {if $settings.menuinfo&64}checked="checked"{/if}>
            <label for="menu-gn">ГН</label>
            
            <input type="checkbox" name="menu-calor" id="menu-calor"
                   {if $settings.menuinfo&128}checked="checked"{/if}>
            <label for="menu-calor">Калории</label>
        </fieldset>
    <fieldset data-role="controlgroup">
        <legend>округление до:</legend>
        <select name="menu-round" id="menu-round-choice" data-disable-page-zoom="false">
            <option value="0" {if $settings.roundto==0}selected="selected"{/if}>До целой</option>
            <option value="1" {if $settings.roundto==1}selected="selected"{/if}>До 0,5</option>
            <option value="2" {if $settings.roundto==2}selected="selected"{/if}>До 0,25</option>
        </select>
    </fieldset>
        <label for="calor-limit">Лимит калорий:</label>
        <input type="number" name="calor-limit" class='set-field' id="calor-limit" placeholder="Лимит ккал" value="{$settings.calorlimit}">
  </div>
  <div id="tab-sh" class="ui-body-d ui-content">
    <h4>Измерение СК</h4>
    
    <fieldset data-role="controlgroup">
        <input type="radio" name="sh-whole" value="yes" class="sh-selector" id="sh-whole-1" {if $settings.whole}checked="checked"{/if}>
        <label for="sh-whole-1">По цельной</label>
        <input type="radio" name="sh-whole" value="no" class="sh-selector" id="sh-whole-2" {if !$settings.whole}checked="checked"{/if}>
        <label for="sh-whole-2">по плазме</label>
    </fieldset>
    
    <fieldset data-role="controlgroup">
        <input type="radio" name="sh-mmol" value="yes" class="sh-selector" id="sh-mmol-mmol" {if $settings.mmol}checked="checked"{/if}>
        <label for="sh-mmol-mmol">ммоль/л</label>
        <input type="radio" name="sh-mmol" value="no" class="sh-selector" id="sh-mmol-mgdl" {if !$settings.mmol}checked="checked"{/if}>
        <label for="sh-mmol-mgdl">мг/дл</label>
    </fieldset>
    <label for="sh-target">Целевой СК:</label>
    <input type="number" name="sh-target" class='set-field sh-field' id="sh-target" placeholder="Целевой СК" value="{$settings.shtarget}">
    <label for="sh-low">Низкий СК:</label>
    <input type="number" name="sh-low" class='set-field sh-field' id="sh-low" placeholder="Низкий СК" value="{$settings.shlow}">
    <label for="sh-high">Высокий СК:</label>
    <input type="number" name="sh-high" class='set-field sh-field' id="sh-high" placeholder="Высокий СК" value="{$settings.shhigh}">
  </div>
    <div id="tab-prod"  class="ui-body-d ui-content">
        <h4>Продукты</h4>
        <fieldset data-role="controlgroup">
            <legend>Заполнить базу продуктами:</legend>
            <label>
            <input type="checkbox" name="prod-fill" id="prod-fill">Заполнить</label>
        </fieldset>
        <fieldset data-role="controlgroup">
            <legend>Частоиспользуемые:</legend>
            <label>
            <input type="checkbox" name="prod-freq-use" id="prod-freq-use" {if $settings.usefreq}checked="checked"{/if}>Использовать</label>
        </fieldset>
        <fieldset data-role="controlgroup">
            <legend>Количество продуктов в частоиспользуемых:</legend>
            <input type="number" name="prod-freq-count"  class='set-field' id="prod-freq-count" value="{$settings.freqcount}">
        </fieldset>
        <fieldset data-role="controlgroup">
            <legend>Количество продуктов, при котором отключается поиск:</legend>
            <input type="number" name="prod-filter-off"  class='set-field' id="prod-filter-off" value="{$settings.filteroff}">
        </fieldset>
    </div>
    <div class="ui-body-d ui-content">
        <input type="submit" data-inline="true" data-icon="check" value="Сохранить" name="save">
        <a href="index.php?{$sid}" class="ui-btn ui-corner-all ui-btn-inline ui-shadow" data-ajax="false">Отмена</a>
    </div>
  </form>
</div>
    
  <div data-role="footer">
    <h1>DiaCalc</h1>
  </div>
  {*Диалог заполнения базы*}
    <div data-role="popup" id="popupFill" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="max-width:400px;">
        <div data-role="header" data-theme="a">
        <h1>Внимание!!!</h1>
        </div>
        <div data-role="main" class="ui-content">
            <h3 class="ui-title">Прочтите внимательно!!!</h3>
            <p>Вы собираетесь заполнить базу продуктами по умолчанию. Если подтвердить свой выбор, то после нажатия на кнопку <strong>Сохранить</strong> будут удалены 
                уже внесенные в базу продукты. Восстановить их возможности не будет.</p>
            <p>После этого в базу будут добавлены продукты "по умолчанию".</p>
            <a href="#" id='cancel-fill' class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Понятно</a>
        </div>
    </div>      
</div>
    
    
    
{include file='footer.tpl'}    