{* Smarty *} 
{include file='header_d.tpl'}
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?18092018"></script>
<script src="js/settings_d.js?18092018"></script>
</head>
<body>
<div class="container well">
    <h2>Настройки программы</h2>
    {*form starts here*}
    <form method="post" action="settings.php?{$sid}" novalidate>
    <div class="row">
        <div class="col-md-4 well">
            <div class="panel panel-default">
                <div class="panel-heading">Меню</div>
                <div class="panel-body">
                    <div class="panel panel-default">
                        <div class="panel-body">
                    <legend>Информация в меню</legend>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-prot' name='menu-prot'
                                  {if $settings.menuinfo&1}checked="checked"{/if} value="">
                        Белки</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-fat' name='menu-fat'
                                  {if $settings.menuinfo&2}checked='checked'{/if} value="">
                        Жиры</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-carb' name='menu-carb'
                                  {if $settings.menuinfo&4}checked='checked'{/if} value="">
                        Углеводы</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-be' name='menu-be'
                                  {if $settings.menuinfo&8}checked='checked'{/if} value="">
                        ХЕ</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-dose' name='menu-dose'
                                  {if $settings.menuinfo&16}checked='checked'{/if} value="">
                        Доза</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-gi' name='menu-gi'
                                  {if $settings.menuinfo&32}checked='checked'{/if} value="">
                        ГИ</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-gn' name='menu-gn'
                                  {if $settings.menuinfo&64}checked='checked'{/if} value="">
                        ГН</label>
                    </div>
                    <div class="checkbox">
                    <label><input type="checkbox" id='menu-calor' name='menu-calor'
                                  {if $settings.menuinfo&128}checked='checked'{/if} value="">
                        Калории</label>
                    </div>
                    </div></div>
                <label for="menu-round-choice">Округлять дозу до:</label>
                <select name="menu-round" id="menu-round-choice" class="form-control">
                    <option value="0" {if $settings.roundto==0}selected="selected"{/if}>До целой</option>
                    <option value="1" {if $settings.roundto==1}selected="selected"{/if}>До 0,5</option>
                    <option value="2" {if $settings.roundto==2}selected="selected"{/if}>До 0,25</option>
                </select>
                <div class="form-group">
                    <label for="calor-limit">Лимит калорий:</label>
                    <input type="number" name="calor-limit" id="calor-limit" class="set-field form-control" placeholder="Лимит калорий" value="{$settings.calorlimit}">    
                </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 well">
            <div class="panel panel-default">
                <div class="panel-heading">Сахар крови</div>
                <div class="panel-body">
                    <div class="panel panel-default">
                        <div class="panel-body">
                    <div class="radio">
                        <label><input type="radio" name="sh-whole" class="sh-selector" value="yes" id="sh-whole-1" {if $settings.whole}checked="checked"{/if}>
                        По цельной</label>
                    </div>
                    <div class="radio">
                        <label><input type="radio" name="sh-whole" class="sh-selector" value="no" id="sh-whole-2" {if !$settings.whole}checked="checked"{/if}>
                        по плазме</label>
                    </div>        
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-body">
                            <div class="radio">
                            <label><input type="radio" name="sh-mmol" class="sh-selector" value="yes" id="sh-mmol-mmol" {if $settings.mmol}checked="checked"{/if}>
                            ммоль/л</label>
                            </div>
                            <div class="radio">
                            <label><input type="radio" name="sh-mmol" class="sh-selector" value="no" id="sh-mmol-mgdl" {if !$settings.mmol}checked="checked"{/if}>
                            мг/дл</label></div>
                        </div>
                    </div>
                    <div class="form-group">
                    <label for="sh-target">Целевой СК:</label>
                    <input type="number" name="sh-target" id="sh-target" class="set-field form-control" placeholder="Целевой СК" value="{$settings.shtarget}">
                    </div>
                    <div class="form-group">
                    <label for="sh-low">Низкий СК:</label>
                    <input type="number" name="sh-low" id="sh-low" class="set-field form-control" placeholder="Низкий СК" value="{$settings.shlow}">
                    </div>
                    <div class="form-group">
                    <label for="sh-high">Высокий СК:</label>
                    <input type="number" name="sh-high" id="sh-high" class="set-field form-control" placeholder="Высокий СК" value="{$settings.shhigh}">
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 well">
            <div class="panel panel-default">
                <div class="panel-heading">Продукты</div>
                <div class="panel-body">
                    <div class="form-group">
                    <div class="checkbox">
                        <label><input type="checkbox" name="prod-fill" id="prod-fill">Заполнить базу продуктами</label>
                    </div></div>
                    <div class="form-group">
                        <div class="checkbox">
                        <label>
                        <input type="checkbox" name="prod-freq-use" id="prod-freq-use" {if $settings.usefreq}checked="checked"{/if}>
                        Использовать частоиспользуемые</label>
                        </div>
                        <label for="prod-freq-count">Количество продуктов в частоиспользуемых:</label>
                        <input type="number" name="prod-freq-count" class="set-field form-control" id="prod-freq-count" value="{$settings.freqcount}">
                    </div>
                    <div class="form-group">
                        <label for="prod-filter-off">Количество продуктов, при котором отключается поиск:</label>
                        <input type="number" name="prod-filter-off" class="set-field form-control" id="prod-filter-off" value="{$settings.filteroff}">
                    </div>
                </div>
                </div>
            </div>
        </div>
    {*Button should be here *}
        <button type="submit" name="save" class="btn btn-primary"><span class="glyphicon glyphicon-ok"></span> Сохранить</button>
        <a href="index.php?{$sid}" class="btn btn-default" role="button">Отмена</a>
    </form>
    <!-- Modal -->
    <div id="popupFill" class="modal fade" role="dialog">
        <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Прочтите внимательно!!!</h4>
      </div>
      <div class="modal-body">
        <p>Вы собираетесь заполнить базу продуктами по умолчанию. Если подтвердить свой выбор, то после нажатия на кнопку <strong>Сохранить</strong> будут удалены 
                уже внесенные в базу продукты. Восстановить их возможности не будет.</p>
            <p>После этого в базу будут добавлены продукты "по умолчанию".</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Понятно</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="cancel-fill">Отмена</button>
      </div>
    </div>

    </div>
  </div>
</div>

<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="js/ie10-viewport-bug-workaround.js"></script>
{include file='footer_d.tpl'}
