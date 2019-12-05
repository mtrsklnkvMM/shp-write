var write = require('./write');
var geojson = require('./geojson');
var defaultPrj = require('./prj');
var JSZip = require('jszip');

module.exports = function(gj, options) {
  var zip = new JSZip();
  var container = zip;
  if(options && options.folder){
    container = zip.folder(options.folder);
  }
  var prj = (options && options.prj) ? options.prj : defaultPrj;

  [geojson.point(gj), geojson.line(gj), geojson.polygon(gj)]
    .forEach(function(l) {
      if (l.geometries.length && l.geometries[0].length) {
        write(
          // field definitions
          l.properties,
          // geometry type
          l.type,
          // geometries
          l.geometries,
          function(err, files) {
            var fileName = options && options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
            container.file(fileName + '.shp', files.shp.buffer, { binary: true });
            container.file(fileName + '.shx', files.shx.buffer, { binary: true });
            container.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
            container.file(fileName + '.prj', prj);
          });
      }
    });

  return zip.generateAsync({
    type: process.browser === undefined ? 'nodebuffer' : 'blob',
    compression: 'DEFLATE'
  });
};
