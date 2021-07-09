{*Smarty*}
{include file='header.tpl'}
<link rel="stylesheet" type="text/css" href="css/coefs.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?18092018"></script>
<script src="js/coefs.js?01112018"></script>
<script>
    var settings ={ldelim}
        whole   : {$settings.whole},
        mmol    : {$settings.mmol},
        timedcoefs:{$settings.timedcoefs}
    {rdelim}; 
    var target = new Sugar(settings.shtarget);
</script>
</head>
<body {*oncontextmenu="return false;"*}>

<div data-role="page" id="coef-page">
  <div data-role="header" data-position="fixed">
      <a href="index.php?{$sid}" class="ui-btn ui-corner-all ui-btn-inline ui-btn-icon-left ui-icon-home ui-shadow" data-ajax="false">Домой</a>
      <h3>Коэффициенты</h3>
    <div data-role="navbar"  data-iconpos="left">
	<ul>
            <li><button id="coef-add-btn" data-icon="plus" class="ui-shadow ui-corner-all">Нов</button></li>
            <li><button id="coef-edit-btn" data-icon="edit" class="ui-shadow ui-corner-all">Изм</button></li>
            <li><button id="coef-delete-btn" data-icon="delete" class="ui-shadow ui-corner-all">Удалить</button></li>
	</ul>
    </div><!-- /navbar -->
  </div> <!-- header -->
  <div data-role="main" class="ui-content">
    <label>
        <input type="checkbox" value="" id="chk-timed-coefs" 
            {if $settings.timedcoefs}checked="checked"{/if}>
        Расчет коэффициентов по времени
    </label>
  <table data-role="table" id="coefs-table"  class="coefs-list">
  <thead>
    <tr>
      <th data-priority="1">#</th>
      <th data-priority="persist">k1</th>
      <th data-priority="2">k2</th>
      <th data-priority="3">ЦЕИ</th>
    </tr>
  </thead>
  <tbody id="coefs-table-body">
    {*<tr>
      <th>09:00</th>
      <td>1.05</td>
      <td>0.25</td>
      <td>36</td>
    </tr>
    <tr>
      <th>18:00</th>
      <td>1.50</td>
      <td>0.50</td>
      <td>26</td>
    </tr>*}
  </tbody>
  </table>
  <hr>
     <label for="user-weight">Ваш вес
     <input type="number" data-clear-btn="false" name="user-weight" id="user-weight" step="1" value="{$settings.weight}"></label>
     <label for="k3-factor">Коэффициент рассчета ЦЕИ
     <input type="number" data-clear-btn="false" name="k3-factor" id="k3-factor" step="1" value="{$settings.k3factor}"></label>
    <button id="btn-calc-k3" data-icon="bullets" class="ui-shadow ui-corner-all">Рассчитать ЦЕИ</button>
  
  </div> <!-- content -->
  {*Диалог коэф-ов*}
    <div data-role="popup" id="popupCoefs" data-theme="a" class="ui-corner-all">
        <div style="padding:10px 20px;">
            <h3>Коэффициенты</h3>
            <div class="dispInlineLabel"><label for="coefTime">Время:</label></div>
            <div class="dispInline"><input type="time" step="1:00" name="coefTime" id="coefTime" 
                   placeholder="Время" data-theme="a" class="coefs-input"></div>
            <!-- Clear floats for each new line -->
            <div class="clearFloats"></div>
        
            <div class="dispInlineLabel"><label for="coefK1">k1:</label></div>
            <div class="dispInline"><input type="number" name="coefK1" id="coefK1" 
                    placeholder="k1" data-theme="a" class="coefs-input"></div>
            <!-- Clear floats for each new line -->
            <div class="clearFloats"></div>
        
            <div class="dispInlineLabel"><label for="coefK2" >k2:</label></div>
            <div class="dispInline"><input type="number" name="coefK2" id="coefK2" 
                  placeholder="k2" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            <div class="dispInlineLabel"><label for="coefK3">ЦЕИ:</label></div>
            <div class="dispInline"><input type="number" name="coefK3" id="coefK3" 
                placeholder="ЦЕИ" data-theme="a" class="coefs-input"></div>
            <div class="clearFloats"></div>
            
            <a href="#" id="popup-coef-cancel" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
            <a href="#" id="popup-coef-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" {*data-rel="back"*} data-transition="flow">Добавить</a>
        </div>
    </div>{*Конец диалога коэ-ов*}
</div>  
    
{include file='footer.tpl'}
