Ext.define('DIGT.Active_calls_Grid', {
    extend : 'DIGT.Grid',
    status_grid : true,
     		
    store_cfg: { 
        storeId:'test_storeId',
        autorefresh : false,  
        fields : ['time', 'caller', 'called', 'duration', 'status'],
        storeId :'active_calls'
    }, 	
    initComponent : function () {
        //this.title = DIGT.msg.active_calls;
        this.store.autorefresh = false;  
        this.store.fields = ['time', 'caller', 'called', 'duration', 'status'];
        this.store.storeId ='active_calls';
        this.viewConfig.loadMask = false;
        //this.columns = [{width:120}];
        this.callParent(arguments);
    }
})
