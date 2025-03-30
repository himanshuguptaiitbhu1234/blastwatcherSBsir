
export const mines = [
  {
    id: 1,
    name: 'Jayanta OCP',
    location: 'Eastern Region',
    type: 'Open Cast',
  },
  {
    id: 2,
    name: 'Khadia OCP',
    location: 'Central Region',
    type: 'Open Cast',
  },
  {
    id: 3,
    name: 'Beena OCP',
    location: 'Western Region',
    type: 'Open Cast',
  },
];

export const blastRecords = [
  {
    id: 1,
    mineId: 1,
    date: '2023-10-15',
    time: '14:30',
    location: 'North Face, Block A',
    burden: 3.5,
    spacing: 4.2,
    depth: 10.5,
    numHoles: 25,
    chargePerHole: 85,
    rowDelay: 25,
    holeDelay: 17,
    distance: 350,
    buildingsPresent: true,
    measuredPPV: 12.5,
    damageLevel: 'Minor',
    notes: "notes"
  },
  {
    id: 2,
    mineId: 2,
    date: '2023-10-18',
    time: '11:15',
    location: 'East Face, Section C',
    burden: 3.2,
    spacing: 3.8,
    depth: 9.0,
    numHoles: 18,
    chargePerHole: 70,
    rowDelay: 23,
    holeDelay: 15,
    distance: 500,
    buildingsPresent: false,
    measuredPPV: 8.3,
    damageLevel: 'None'
  },
  {
    id: 3,
    mineId: 3,
    date: '2023-10-20',
    time: '16:45',
    location: 'South Face, Block D',
    burden: 4.0,
    spacing: 4.5,
    depth: 12.0,
    numHoles: 30,
    chargePerHole: 95,
    rowDelay: 27,
    holeDelay: 19,
    distance: 280,
    buildingsPresent: true,
    measuredPPV: 15.2,
    damageLevel: 'Moderate'
  },
];

export const damageCategories = [
  { level: 'None', ppvRange: '0-10 mm/s', description: 'No observable damage' },
  { level: 'Minor', ppvRange: '10-25 mm/s', description: 'Fine cracks in plaster, small chips' },
  { level: 'Moderate', ppvRange: '25-50 mm/s', description: 'Cracks in walls, broken windows' },
  { level: 'Severe', ppvRange: '50-100 mm/s', description: 'Major structural damage, unsafe conditions' },
  { level: 'Extreme', ppvRange: '>100 mm/s', description: 'Partial or complete building collapse' },
];
