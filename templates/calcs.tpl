{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/calcs.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
{*<script src="js/BootstrapMenu.min.js"></script>
<script src="js/classes.js?18092018"></script>
<script src="js/jquery.scrollTo-min.js"></script>*}
<script src="js/classes.js?01112018"></script>
<script src="js/calcs.js"></script>

<script>
    var settings ={ldelim}
        be      : {$be}
    {rdelim};
</script>
</head>
<body>

<nav class="navbar navbar-default" id="navbar">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">DiaCalc online &bull; Расчёты</a>
    </div>
    <div class="collapse navbar-collapse" id="myNavbar">
    <ul class="nav navbar-nav">
      <li><a href="index.php?{$sid}"><span class="glyphicon glyphicon-cutlery"></span> Расчет доз</a></li>
      <li><a href="diary.php?{$sid}"><span class="glyphicon glyphicon-book"></span> Дневник</a></li>
    </ul>
    <ul class="nav navbar-nav">
	<li class="dropdown">
	  <a class="dropdown-toggle" data-toggle="dropdown" href="#"><span class="glyphicon glyphicon-cog"></span> Дополнительно
           <span class="caret"></span></a>
            <ul class="dropdown-menu">      
	     <li><a href="archive.php?{$sid}"><span class="glyphicon glyphicon-briefcase"></span> Архив</a></li>
             <li><a href="coefs.php?{$sid}"><span class="glyphicon glyphicon-list-alt"></span> Коэффициенты</a></li>
             <li role="separator" class="divider"></li>
             <li><a href="settings.php?{$sid}"><span class="glyphicon glyphicon-wrench"></span> Настройки</a></li>
             <li><a href="changepass.php?{$sid}"><span class="glyphicon glyphicon-user"></span> Сменить пароль</a></li>
            </ul>
         </li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <li><a href="?exit&{$sid}"><span class="glyphicon glyphicon-log-in"></span> Выход</a></li>
    </ul>
    </div>
  </div>
</nav>

<div class="container well" id="main">
<div class="row"> <!--Пересчеты крови -->
    <div class='col-sm-4'>
        <div class="panel panel-default">
          <div class="panel-heading">Глюкоза крови</div>
            <div class="panel-body">
                <div class="input-group">
                    <span class="input-group-addon names">Цельная</span>
                    <input id="wholemmol" type="number" class="form-control group1" step='0.1' value='5.6'>
                    <span class="input-group-addon meas">ммоль/л</span>
                </div>
                <div class="input-group">
                    <span class="input-group-addon names">Плазма</span>
                    <input id="plasmammol" type="number" class="form-control group1" step='0.1' value='6.3'>
                    <span class="input-group-addon meas">ммоль/л</span>
                </div>
                <div class="input-group">
                    <span class="input-group-addon names">Цельная</span>
                    <input id="wholemgdl" type="number" class="form-control group1" step='1' value='101'>
                    <span class="input-group-addon meas">мг/дл</span>
                </div>
                <div class="input-group">
                    <span class="input-group-addon names">Плазма</span>
                    <input id="plasmamgdl" type="number" class="form-control group1" step='1' value='113'>
                    <span class="input-group-addon meas">мг/дл</span>
                </div>
                <div class="input-group">
                    <span class="input-group-addon names">ГГ (HbA1c)</span>
                    <input id="hba1c" type="number" class="form-control group1" step='0.1' value='5.6'>
                    <span class="input-group-addon meas">%</span>
                </div>
            </div>
        </div><!-- panel -->
    </div>
    <div class='col-sm-8'>
        <div class="panel panel-default">
          <div class="panel-heading">Влияние на гликемию</div>
          <div class="panel-body">
              <div class="row">
                  <div class="col-sm-4">
                    <div class="input-group">
                        <span class="input-group-addon names2">ЦЕИ</span>
                        <input id="glyc-ouv" type="number" class="form-control group2" step='0.01' value='2.00'>
                    </div>
                    <div class="input-group">
                        <span class="input-group-addon names2">k1</span>
                        <input id="glyc-k1" type="number" class="form-control group2" step='0.01' value='1.00'>
                    </div>
                      <div class="row">
                          <div class="col-sm-6">
                                <div class="radio">
                                    <label><input id="glyc-radio-mmol" class="glyc-radio" type="radio" name="radio-1" checked>ммоль/л</label>
                                </div>
                                <div class="radio">
                                    <label><input id="glyc-radio-mgdl" class="glyc-radio" type="radio" name="radio-1">мг/дл</label>
                                </div>
                          </div>
                          <div class="col-sm-6">
                                <div class="radio">
                                    <label><input id="glyc-radio-whole" class="glyc-radio" type="radio" name="radio-2">цельная</label>
                                </div>
                                <div class="radio">
                                    <label><input id="glyc-radio-plasma" class="glyc-radio" type="radio" name="radio-2" checked>плазма</label>
                                </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-sm-8">
                      <div class="row">
                            <div class="col-xs-6">
                                <table><thead>
                                    <tr><th>инс.ед.</th><th class="name-insulin">ммоль/л<br>плазма</th>
                                    </tr>
                                </thead><tbody>
                                    <tr><td>0.1</td><td id="glyc-ins-01"></td></tr>
                                    <tr><td>0.2</td><td id="glyc-ins-02"></td></tr>
                                    <tr><td>0.25</td><td id="glyc-ins-025"></td></tr>
                                    <tr><td>0.5</td><td id="glyc-ins-05"></td></tr>
                                </tbody></table>
                            </div>
                            <div class="col-xs-6">
                                <table><thead>
                                    <tr><th>угл.гр</th><th class="name-insulin">ммоль/л<br>плазма</th>
                                    </tr>
                                </thead><tbody>
                                    <tr><td>1</td><td id="glyc-carb-1">33.3</td></tr>
                                    <tr><td>2</td><td id="glyc-carb-2">33.3</td></tr>
                                    <tr><td>5</td><td id="glyc-carb-5">33.3</td></tr>
                                    <tr><td>10</td><td id="glyc-carb-10">33.3</td></tr>
                                </tbody></table>
                            </div>
                      </div>
                 </div>
              </div><!--row-->
          </div>
        </div><!-- panel -->
    </div>
</div>
<div class="panel panel-default">
    <div class="panel-heading">ИМТ и коррекция веса</div>
    <div class="panel-body">
        <div class="row">
            <div class="col-sm-3">
                <form class="form-horizontal">
                <div class="form-group">
                  <label class="control-label col-sm-4" for="bmi">ИМТ:</label>
                  <div class="col-sm-8">
                    <p class="form-control-static" id="bmi"></p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-4" for="weight">Вес кг.:</label>
                  <div class="col-sm-8">          
                    <input type="number" class="form-control control-bmi group3" id="weight" placeholder="Введите вес" name="weight" step="1" value="{$weight}">
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-4" for="height">Рост см.:</label>
                  <div class="col-sm-8">          
                    <input type="number" class="form-control control-bmi group3" id="height" placeholder="Введите рост" name="height" step="1">
                  </div>
                </div>
                </form>
                  <p id="bmi-message"></p>
                  <p style="font-size: 0.85em; font-weight: bold;">Внимание! ИМТ рассчитанный у детей (до 18 лет), должен 
                      интерпретироваться специальным образом!<br>
                      Подробнее <a href="https://diacalc.org/BMIchildren.html" target="_blank">тут</a></p>
            </div>
            <div class="col-sm-4">
                <div class="form-group">
                    <label for="age">Возраст:</label>
                    <input type="number" class="form-control  group3" id="age" placeholder="Введите возраст" name="age" step="1">
                </div>
                
                <div class="form-group">
                    <label for="target-weight">Целевой вес:</label>
                    <input type="number" class="form-control group3" id="target-weight" placeholder="Введите вес" name="target-weight" step="1">
                </div>
                <div class="form-group">
                    <label for="term">Период коррекции (месяцев):</label>
                    <select class="form-control group3" name="term" id="term">
                        <option value="12">12</option>
                    </select>
                </div>
            </div>
            <div class="col-sm-5">
                <div class="form-group">
                    <fieldset><strong>Ваш пол</strong></fieldset>
                    <label class="radio-inline">
                      <input class="group3" type="radio" name="optradio" id="male">Мужской
                    </label>
                    <label class="radio-inline">
                      <input class="group3" type="radio" name="optradio" id="female">Женский
                    </label>
                </div>
                <div class="form-group">
                    <label for="activity-range">Активность: <span id='activity-descr'>Лёгкая</span> &bull; Количество шагов: 
                        <span id="activity-steps">≈7500</span></label>
                    <input class="group3" id="activity-range" name="activity-range" type="range" 
                           min="110" max="180" value="115" step='5'>
                </div>
                <p><strong>Норма потребления ккал/сут.</strong></p>
                <p id="not-filled">Не все поля заполнены</p>
                <table id="calories-result" style="display: none;">
                    <tbody>
                        <tr><td>Для текущего веса</td><td id="calories-current-w"></td></tr>
                        <tr><td>Для целевого веса</td><td id="calories-target-w"></td></tr>
                        <tr><td>Для достижения целевого веса</td><td id="calories-correction-w"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
</div> <!-- container well -->

{include file='footer_d.tpl'}    