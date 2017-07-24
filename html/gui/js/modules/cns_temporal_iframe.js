XDMoD.Module.CnsTemporalIframe = Ext.extend(XDMoD.PortalModule, {

    title: 'Visualizations',
    module_id: 'cns_temporal_iframe',
    usesToolbar: false,
    toolbarItems: {
        durationSelector: false,
        exportMenu: false,
        printButton: false,
        reportCheckbox: false
    },
    initComponent: function () {
        Ext.apply(this, {
            items: [
                {
                    xtype: 'panel',
                    region: 'center',
                    height: '100%',
                    width: '100%',
                    html: '<iframe src="/xdmodtemporal/index.html?version=test" style="width:100%;height:100%;border:none;"></iframe>'
                }
            ]
        });
        XDMoD.Module.CnsTemporalIframe.superclass.initComponent.apply(this, arguments);
    }
});
