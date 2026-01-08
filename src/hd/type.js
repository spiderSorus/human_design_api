const { hasDefinedCenterConnection } = require('./centers');

// HD Type derivation from defined centers/channels.
// Rules (simplified but standard):
// - Reflector: no defined centers
// - Manifestor: defined throat AND a motor connected to throat
// - Generator family: defined sacral. If ALSO a motor connects to throat => Manifesting Generator, else Generator
// - Projector: everything else with at least one defined center
//
// Motors: heart/ego, solar plexus, sacral, root.
const MOTORS = ['heart', 'solarPlexus', 'sacral', 'root'];

function hasMotorToThroat(definedChannels) {
  return MOTORS.some((motor) => hasDefinedCenterConnection(definedChannels, motor, 'throat'));
}

function deriveType({ definedChannels, definedCenters }) {
  if (!definedCenters || definedCenters.length === 0) return 'Reflector';

  const sacralDefined = definedCenters.includes('sacral');
  const throatDefined = definedCenters.includes('throat');
  const motorToThroat = throatDefined && hasMotorToThroat(definedChannels);

  if (sacralDefined) {
    return motorToThroat ? 'Manifesting Generator' : 'Generator';
  }

  if (motorToThroat) return 'Manifestor';

  return 'Projector';
}

module.exports = { deriveType };
