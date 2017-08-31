/** @global 
 * @description Maps pretty names for datasource URLs. Mapped from (ng-data-field) 
 * @type {Object} */
 var globalDatasourceMap = {
    one: {
        url: '../../data/sampleData.json',
        type: 'static'
    },
    sampleGeoData: {
        url: '../../data/sampleGeoData.json',
        type: 'static'
    },
    apiTest: {
        url: 'http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&format=json',
        type: 'api',
        params: {
            api_key: '',
            artist: 'QUERYSTRING'
        }
    },
    copiData: {
        url: 'data/copiData.json'
    },
    copiForBG: {
        url: 'data/copiDataAsRecords.json'
    },
    sankeyData: {
        url: 'data/sankey-NIH-Discipline.json'
    }

}
