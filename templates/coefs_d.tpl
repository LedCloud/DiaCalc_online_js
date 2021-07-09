{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/coefs_d.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?18092018"></script>
<script src="js/coefs_d.js?01112018"></script>
<script>
    var settings ={ldelim}
        whole   : {$settings.whole},
        mmol    : {$settings.mmol},
        timedcoefs:{$settings.timedcoefs}        
    {rdelim}; 
    var target = new Sugar(settings.shtarget);
</script>
</head>
<body>
<div class="container well" id="main">
    <div class="row">
        <div class="col-sm-7">
            <div class="panel panel-default">
                <div class="panel-body">
                    <h3>Коэффициенты</h3>
                    <div class="checkbox">
                      <label><input type="checkbox" value="" id="chk-timed-coefs" 
                            {if $settings.timedcoefs}checked="checked"{/if}>
                          Расчет коэффициентов по времени</label>
                    </div>
                    <table class="table table-condensed">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>k1</th>
                        <th>k2</th>
                        <th>ЦЕИ</th>
                      </tr>
                    </thead>
                    <tbody id="coefs-table-body">
                      
                    </tbody>
                  </table>
                    <button type="button" class="btn btn-default" id="btn-add">
                        <span class="glyphicon glyphicon-plus"></span> Добавить</button>
                    <button type="button" class="btn btn-default" id="btn-edit">
                        <span class="glyphicon glyphicon-edit"></span> Изменить</button>
                    <button type="button" class="btn btn-default pull-right" id="btn-delete">
                        <span class="glyphicon glyphicon-remove"></span> Удалить</button>
                </div>
            </div>
            
        </div>
        <div class="col-sm-5">
            <div class="row">
                <div class="col-sm-6">
                    <div class="form-group">
              <label for="user-weight">Ваш вес кг.:</label>
              <input type="text" class="form-control" id="user-weight" step="1" value="{$settings.weight}">
            </div>
                </div>
                <div class="col-sm-6">
                    <div class="form-group">
              <label for="k3-factor">Коэффициент расчета ЦЕИ:</label>
              <input type="text" class="form-control" id="k3-factor" step="1" value="{$settings.k3factor}">
            </div>
                </div>
            </div>
            
            
            <button type="button" class="btn btn-default" id="btn-calc-k3">Рассчитать ЦЕИ</button>
            <div class="alert alert-info">
              Коэффициенты будут рассчитаны только в таблице на этой странице!
            </div>
        </div>
    </div>
    <a href="index.php?{$sid}" class="btn btn-default" role="button"><span class="glyphicon glyphicon-home"></span> Назад</a>
{*dialog add coefs*}
<div id="dlg-add-coefs" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title" id="dlg-coef-header">Добавить коэффициенты</h4>
      </div>
      <div class="modal-body">
          <form class="form-horizontal">
          <div class="form-group">
              <div class="col-sm-3">          
                <label class="control-label" for="coefs-dialog-time">Время:</label>
                <input type="time" class="form-control" id="coefs-dialog-time" placeholder="Время" step="1:00">
              </div>
              <div class="col-sm-3">          
                <label class="control-label" for="coefs-dialog-k1">k1:</label>
                <input type="number" class="form-control" id="coefs-dialog-k1" placeholder="k1" step="0.01">
              </div>
              <div class="col-sm-3">          
                <label class="control-label" for="coefs-dialog-k2">k2:</label>
                <input type="number" class="form-control" id="coefs-dialog-k2" placeholder="k2" step="0.01">
              </div>
              <div class="col-sm-3">          
                <label class="control-label" for="coefs-dialog-k3">ЦЕИ:</label>
                <input type="number" class="form-control" id="coefs-dialog-k3" placeholder="ЦЕИ" step="0.01">
              </div>
              
          </div>
          </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" {*data-dismiss="modal"*} id="dlg-add-coefs-ok">
            Добавить</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
      </div>
    </div>
    </div>
</div>    
</div> <!-- конец главного контейнера -->

{include file='footer_d.tpl'}    