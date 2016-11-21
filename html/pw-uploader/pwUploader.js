/**
 * uploader api : http://www.jq22.com/yanshi2665
 * Layer api : http://www.layui.com/doc/modules/layer.html
 */

var pwUploader = {

    layer: null,
    uploader: null,
    server: '',
    swf:'',
    picIdsSL:'',
    fileIdsSL:'',
    openLayerBtnSL:'',
    layerOffset:{},

    /**
     * 初始化数据
     * @param opts{
     * server:服务端,
     * swf: Web Uploader swf文件路径,
     * picIds: 隐藏域picIds的id,
     * fileIds:隐藏域fileIds的id,
     * openLayerBtn:打开上传Layer的元素id,
     * layerOffset:layer坐标
     * }
     */
    init: function(opts){

        var me = this;

        layui.use('layer', function(){
            me.layer = layui.layer;
        });

        me.server = opts.server || '';
        me.swf = opts.swf || '';
        me.picIdsSL = '#'+opts.picIds || '#picIds';
        me.fileIdsSL = '#'+opts.fileIds || '#fileIds';
        me.openLayerBtnSL = '#'+opts.openLayerBtn || '#openLayerBtn';
        me.layerOffset = opts.layerOffset || {
                top: $(me.openLayerBtnSL).offset().top+$(me.openLayerBtnSL).height,
                left:$(me.openLayerBtnSL).offset().left
            };

        //生成元素
        me.registerElements(opts);

        //绑定事件
        me.bindEvents();

    },

    /**
     * 生成元素
     */
    registerElements: function(opts){

        var me = this,
            picIds = opts.picIds || 'picIds',
            fileIds = opts.fileIds || 'fileIds',
            picIdsHidden = $(document.createElement('input')),
            fileIdsHidden = $(document.createElement('input'));

        picIdsHidden.attr( 'type', 'hidden' );
        picIdsHidden.attr( 'id', picIds );
        //picIdsHidden.attr( 'value', '' );

        fileIdsHidden.attr( 'type', 'hidden' );
        fileIdsHidden.attr( 'id', fileIds );
        //fileIdsHidden.attr( 'value', '' );

        var $layerContent = $(
            '<div id="filePicker">选择图片</div>' +
            '<div class="upload-layer">' +
                '<div class="upload-grid">'+
                    '<li class="upload-item add-item">' +
                        '<div class="upload-add">'+
                            '<a href="#">+</a>'+
                        '</div>' +
                    '</li>'+
                '</div>'+
            '</div>'
        );

        $(me.openLayerBtnSL).after(picIdsHidden);
        $(me.openLayerBtnSL).after(fileIdsHidden);
        $(me.openLayerBtnSL).after($layerContent);

    },

    /**
     * 绑定事件
     */
    bindEvents: function(){

        var me = this;

        //绑定WebUploader事件
        me.bindWebUploader();

        //打开Layer的按钮点击事件绑定
        $(me.openLayerBtnSL).on('click', function(){

            me.layer.open({
                id:'myUploadLayer',
                title: '图片上传',
                type: 1,
                area: ['260px'],
                offset: [me.layerOffset.top, me.layerOffset.left],
                shade: false,
                resize: false,
                move:false,
                content: $('.upload-layer'),
                cancel: function(){

                    //重置Layer
                    var html = '<div class="upload-grid">' +
                        '<li class="upload-item add-item">' +
                        '<div class="upload-add">'+
                        '<a href="#">+</a>' +
                        '</div>' +
                        '</li>' +
                        '</div>';

                    $('.upload-layer').html(html);
                    $(me.picIdsSL).val('');
                    $(me.fileIdsSL).val('');
                    me.uploader.reset();
                }
            });

        });

        //触发上传文件
        function triggerFilePicker(){
            $('#filePicker div label').click();
        };

        function throttle(method,context){
            clearTimeout(method.tId);
            method.tId = setTimeout(function(){
                method.call(context);
            },200);
        };

        //上传文件点击事件
        $(document).on('click', '.upload-add', function(){
            //throttle(triggerFilePicker);
            triggerFilePicker();
        });

        //删除图标点击事件
        $(document).on('click', '.delete-icon', function(){
            var fileId = $(this).attr('data-file');
            var picId = $(this).attr('data-pic');

            var selector = '#'+ fileId;
            $(selector).remove();//移除元素

            //移除file
            me.uploader.removeFile(me.uploader.getFile(fileId),true);

            //更新隐藏域
            me.removeHiddenIds(fileId,picId);
            //刷新Layer
            me.refreshLayer('delete');
        });
    },

    /**
     * 绑定WebUploader事件
     */
    bindWebUploader: function(){

        var me = this;

        // 初始化Web Uploader
        me.uploader = WebUploader.create({

            // 选完文件后，是否自动上传。
            auto: true,

            // swf文件路径
            swf: me.swf,

            // 文件接收服务端。
            server: me.server,

            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#filePicker',

            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            },

            fileNumLimit: 9,

            threads:1

        });
        // 当有文件添加进来的时候
        me.uploader.on( 'fileQueued', function( file ) {

            var $li = $(
                    '<li class="upload-item" id="'+ file.id + '">' +
                    '<div class="upload-thumbnail">'+
                    '<img>' +
                    '<span></span>'+
                    '<i class="layui-icon delete-icon" data-pic="" data-file="'+ file.id + '">&#xe640;</i>'+
                    '</div>' +
                    '</li>'
                ),
                $img = $li.find('img');

            $('.add-item').before($li);//插入元素

            // 创建缩略图
            // 如果为非图片文件，可以不用调用此方法。
            // thumbnailWidth x thumbnailHeight 为 100 x 100
            me.uploader.makeThumb( file, function( error, src ) {
                if ( error ) {
                    $img.replaceWith('<span>不能预览</span>');
                    return;
                }
                $img.attr( 'src', src );
            }, 80, 80 );

            //更新隐藏域
            me.addHiddenIds(file.id,null);
            //刷新Layer
            me.refreshLayer('add');

        });
        // 文件上传过程中创建进度条实时显示。
        me.uploader.on( 'uploadProgress', function( file, percentage ) {
            var $li = $( '#'+file.id ),
                $percent = $li.find('.progress span');

            // 避免重复创建
            if ( !$percent.length ) {
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
            }

            $percent.css( 'width', percentage * 100 + '%' );
        });

        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        me.uploader.on( 'uploadSuccess', function( file ,response) {

            if(response && response.picId){

                var picId = response.picId;

                var selector = '#'+ file.id +' div i';
                $(selector).attr('data-pic',picId);

                //更新隐藏域
                me.addHiddenIds(null,picId);

            }

            $( '#'+file.id ).addClass('upload-state-done');
        });

        // 文件上传失败，显示上传出错。
        me.uploader.on( 'uploadError', function( file ) {

            var fileId = file.id;

            alert(fileId + '上传失败,demo暂时注释删除元素代码！');

            /**
            var selector = '#'+ fileId;
            $(selector).remove();//移除元素

            //移除file
            me.uploader.removeFile(me.uploader.getFile(fileId),true);

            //更新隐藏域
            me.removeHiddenIds(fileId,null);
            //刷新Layer
            me.refreshLayer('delete');
            **/

        });

        // 完成上传完了，成功或者失败，先删除进度条。
        me.uploader.on( 'uploadComplete', function( file ) {
            $( '#'+file.id ).find('.progress').remove();
        });
    },

    /**
     * 新增图片时更新隐藏域
     * @param fileId
     * @param picId
     */
    addHiddenIds: function(fileId, picId){

        var me = this;

        if (fileId) {

            var fileIds = $(me.fileIdsSL).val();

            if (fileIds.length == 0) {
                fileIds = fileId;

            } else {
                fileIds = fileIds + ',' + fileId;
            }
            $(me.fileIdsSL).val(fileIds);
        }

        if(picId){
            var picIds = $(me.picIdsSL).val();

            if(picIds.length==0){
                picIds = picId;

            }else {
                picIds = picIds + ',' + picId;
            }
            $(me.picIdsSL).val(picIds);
        }
    },
    /**
     * 删除图片时更新ids隐藏域
     * @param fileId
     * @param picId
     */
    removeHiddenIds: function(fileId, picId){

        var me = this;

        if (fileId) {

            var fileIds = $(me.fileIdsSL).val();

            if(fileIds.indexOf(','+fileId)>-1){
                fileIds = fileIds.replace(','+fileId,'');
            }else if(fileIds.indexOf(fileId+',')>-1){
                fileIds = fileIds.replace(fileId+',','');
            }else if(fileIds.indexOf(fileId)>-1){
                fileIds = fileIds.replace(fileId,'');
            }
            $(me.fileIdsSL).val(fileIds);
        }

        if (picId) {

            var picIds = $(me.picIdsSL).val();

            if(picIds.indexOf(','+picId)>-1){
                picIds = picIds.replace(','+picId,'');
            }else if(picIds.indexOf(picId+',')>-1){
                picIds = picIds.replace(picId+',','');
            }else if(picIds.indexOf(picId)>-1){
                picIds = picIds.replace(picId,'');
            }
            $(me.picIdsSL).val(picIds);

        }
    },
    /**
     * 刷新Layer高度和上传按钮
     * @param type
     */
    refreshLayer:function(type){

        var me = this;
        var fileIds = $(me.fileIdsSL).val();
        var fileNum = fileIds.split(',').length;

        if(type == 'add' && fileNum >= 9){
            $('.add-item').remove();
        }else if(type == 'delete' && fileNum == 8){
            var $li = $(
                '<li class="upload-item add-item">' +
                '<div class="upload-add">'+
                '<a href="#">+</a>' +
                '</div>' +
                '</li>'
            );
            $('.upload-grid').append($li);
        }

        if(fileNum >= 6){
            $('#myUploadLayer').css('height','270px');
        }else if(fileNum >= 3){
            $('#myUploadLayer').css('height','180px');
        }else{
            $('#myUploadLayer').css('height','90px');
        }
    }
};