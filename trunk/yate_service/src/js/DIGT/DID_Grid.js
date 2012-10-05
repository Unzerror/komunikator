Ext.define('DIGT.DID_Grid', {
    extend : 'DIGT.Grid',
    initComponent : function () {
        this.store.autorefresh = undefined;
        this.store.fields = ['id','did','number', 'destination','description','extension','group'];
        this.store.storeId ='dids';
        this.viewConfig.loadMask = false;
        this.columns = [
        {
            hidden: true
        },

        { 
            editor :  {
                xtype: 'textfield'
            }
            },

            { 
            editor :  {
                xtype: 'textfield'
            }
            },

            { 
            editor :  {
                xtype: 'textfield'
            }
            }
        ];
        this.callParent(arguments); 
    }
})
