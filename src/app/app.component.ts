import { Component } from '@angular/core';
import { EsriLoaderService } from 'angular-esri-loader';
import { EsriModuleProvider } from 'angular-esri-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mapProperties: __esri.MapProperties = {
    basemap: 'streets'
  };
  mapViewProperties: __esri.MapViewProperties = {
    center: [-95.369803, 29.760427],
    zoom: 8
  };
  map: __esri.Map;
  mapView: __esri.MapView;
  
  constructor(private esriLoader: EsriLoaderService, private moduleProvider: EsriModuleProvider) { }

  onMapInit(mapInfo: { map: __esri.Map, mapView: __esri.MapView }) {
    this.map = mapInfo.map;
    this.mapView = mapInfo.mapView;

    // add nat-geo theme
    this.createTileLayer();

    // add a sign + pop-up over HOuston

    // let x = 30.265074;
    // let y = -97.756260;

    // this.createFeatureLayer(x, y, 'Austin, Texas');



    let y =  30.303122;
    let x = -97.739185;
    this.createFeatureLayer(x, y, 'Austin, Texas');

    y =  29.760427;
    x = -95.369803;
    this.createFeatureLayer(x, y, 'Houston, Texas');

    // add a layer with sublayers to map
    this.moduleProvider
      .require(['esri/layers/MapImageLayer'])
      .then(
        ([MapImageLayer]) => {
          const layer = new MapImageLayer({
            url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer',
            sublayers: [
              {
                id: 3,
                title: 'States',
                visible: false
              },
              {
                id: 2,
                title: 'Railroads',
                visible: true
              },
              {
                id: 1,
                title: 'Highways',
                visible: true
              },
              {
                id: 0,
                title: 'Cities',
                visible: true
              }
            ]
          });

          this.map.layers.add(layer);

        });

  }

  createTileLayer() {
    this.esriLoader.loadModules([
      'esri/layers/TileLayer'
    ]).then(([TileLayer]) => {
      const url = "https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer";
      const tileLayer = new TileLayer({
        url: url
      });
      this.map.add(tileLayer);
    });
  }

  createFeatureLayer(x, y, title) {
    this.esriLoader.loadModules([
      'esri/layers/FeatureLayer',
      'esri/PopupTemplate',
      'esri/core/Collection',
      'esri/geometry/Point',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/PictureMarkerSymbol'
    ]).then(([
      FeatureLayer,
      PopupTemplate,
      Collection,
      Point,
      SimpleRenderer,
      PictureMarkerSymbol
    ]) => {
      const graphics = [
        {


          geometry: new Point({
            y: y,
            x: x
          }),
          attributes: {
            title: title
          }
        }];

      const pTemplate = new PopupTemplate({
        title: '{title}'
      });

      const renderer = new SimpleRenderer({
        symbol: new PictureMarkerSymbol({
          url: 'https://cdn3.iconfinder.com/data/icons/caps-hats/512/Detectives_Cap-256.png',
          width: '30px',
          height: '30px'
        })
      });




      const featureLayer = new FeatureLayer({
        fields: [
          {
            name: 'ObjectID',
            alias: 'ObjectID',
            type: 'oid'
          }, {
            name: 'type',
            alias: 'Type',
            type: 'string'
          }, {
            name: 'place',
            alias: 'Place',
            type: 'string'
          }],
        objectIdField: 'ObjectID',
        geometryType: 'point',
        spatialReference: { wkid: 4326 },
        source: graphics,
        popupTemplate: pTemplate,
        renderer: renderer
      });


      this.map.add(featureLayer);
    });
  }
}
