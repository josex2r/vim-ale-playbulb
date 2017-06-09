import debug from 'debug';

const log = debug('Express');

export default function Routes(app, candle) {
  app.post('/changeColor', function(req, res) {
    const saturation = req.body.saturation;
    const r = req.body.r;
    const g = req.body.g;
    const b = req.body.b;
    const result = candle.setColor(saturation, r, g, b);

    log('POST - changeColor:', saturation, r, g, b);
    res.end();
  });
}
