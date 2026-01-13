// Rave Psychology / PHS lookup tables.
//
// Source: user-provided tables (see task conversation).
//
// Note: This module is intentionally data-only plus light helpers so it can be used
// by both full charts and personality-only (just-now) charts.

const translationMap = {
  personality: {
    line: 'view',
    color: 'motivation',
    tone: 'cognition',
    nodes_line: 'perspective',
    nodes_color: 'view'
  },
  design: {
    line: 'environment_type',
    color: 'phs_determination',
    tone: 'internal_sense',
    nodes_line: 'environment_landscape',
    nodes_color: 'environment_style'
  }
};

const tone = {
  1: { internal_sense: 'Smell', cognition: 'Security', orientation: 'Left', binary: 'Strategic' },
  2: { internal_sense: 'Taste', cognition: 'Barrier', orientation: 'Left', binary: 'Strategic' },
  3: { internal_sense: 'Outer Vision', cognition: 'Visual', orientation: 'Left', binary: 'Strategic' },
  4: { internal_sense: 'Inner Vision', cognition: 'Conceptual', orientation: 'Right', binary: 'Receptive' },
  5: { internal_sense: 'Feeling', cognition: 'Electromagnetic', orientation: 'Right', binary: 'Receptive' },
  6: { internal_sense: 'Touch', cognition: 'Acoustic', orientation: 'Right', binary: 'Receptive' }
};

const color = {
  1: {
    phs_determination: 'Appetite',
    fixing: { Left: 'Consecutive', Right: 'Alternating' },
    motivation: 'Fear',
    transference: 'Need',
    description: 'Investigation for the sake of survival.'
  },
  2: {
    phs_determination: 'Taste',
    fixing: { Left: 'Open', Right: 'Closed' },
    motivation: 'Hope',
    transference: 'Guilt',
    description: 'The purity of waiting for a sign.'
  },
  3: {
    phs_determination: 'Thirst',
    fixing: { Left: 'Hot', Right: 'Cold' },
    motivation: 'Desire',
    transference: 'Innocence',
    description: 'Power and material progress through leadership.'
  },
  4: {
    phs_determination: 'Touch',
    fixing: { Left: 'Calm', Right: 'Nervous' },
    motivation: 'Need',
    transference: 'Fear',
    description: 'Focused service and specific influence.'
  },
  5: {
    phs_determination: 'Sound',
    fixing: { Left: 'High', Right: 'Low' },
    motivation: 'Guilt',
    transference: 'Hope',
    description: 'Projecting influence and fixing societal errors.'
  },
  6: {
    phs_determination: 'Light',
    fixing: { Left: 'Direct', Right: 'Indirect' },
    motivation: 'Innocence',
    transference: 'Desire',
    description: 'Being the objective observer of the whole.'
  }
};

const line = {
  1: { environment: 'Caves', view: 'Survival', distraction: 'Want' },
  2: { environment: 'Markets', view: 'Possibility', distraction: 'Probability' },
  3: { environment: 'Kitchens', view: 'Power', distraction: 'Personal' },
  4: { environment: 'Mountains', view: 'Want', distraction: 'Survival' },
  5: { environment: 'Valleys', view: 'Probability', distraction: 'Possibility' },
  6: { environment: 'Shores', view: 'Personal', distraction: 'Power' }
};

const bases = {
  1: { name: 'Design', theme: 'Movement', body_aspect: 'Surface/Cells' },
  2: { name: 'Personality', theme: 'Existence', body_aspect: 'Self/Identity' },
  3: { name: 'Transition', theme: 'Mutation', body_aspect: 'Biology/Interaction' },
  4: { name: 'Integral', theme: 'Totality', body_aspect: 'Universal/Unity' },
  5: { name: 'Destiny', theme: 'Direction', body_aspect: 'Purpose/Trajectory' }
};

function asIntKeyedLookup(lookup, key) {
  const n = Number(key);
  if (!Number.isFinite(n)) return null;
  return lookup[n] ?? null;
}

module.exports = {
  translationMap,
  tone,
  color,
  line,
  bases,
  harmonics: {
    1: 4,
    2: 5,
    3: 6,
    4: 1,
    5: 2,
    6: 3
  },
  phs_regime_labels: {
    1: { name: 'Appetite', left: 'Consecutive', right: 'Alternating' },
    2: { name: 'Taste', left: 'Open', right: 'Closed' },
    3: { name: 'Thirst', left: 'Hot', right: 'Cold' },
    4: { name: 'Touch', left: 'Calm', right: 'Nervous' },
    5: { name: 'Sound', left: 'High', right: 'Low' },
    6: { name: 'Light', left: 'Direct', right: 'Indirect' }
  },
  environment_activity: {
    left: 'Active (Observed)',
    right: 'Passive (Observer)'
  },
  phsDetails: {
    dietary_regime: {
      1: { left: 'Consecutive', right: 'Alternating', theme: 'Conditions' },
      2: { left: 'Open', right: 'Closed', theme: 'Conditions' },
      3: { left: 'Hot', right: 'Cold', theme: 'Circumstances' },
      4: { left: 'Calm', right: 'Nervous', theme: 'Circumstances' },
      5: { left: 'High Sound', right: 'Low Sound', theme: 'Circumstances' },
      6: { left: 'Direct Light', right: 'Indirect Light', theme: 'Circumstances' }
    },
    environment_style: {
      1: { left: 'Selective', right: 'Blending' },
      2: { left: 'Internal', right: 'External' },
      3: { left: 'Wet', right: 'Dry' },
      4: { left: 'Active', right: 'Passive' },
      5: { left: 'Narrow', right: 'Wide' },
      6: { left: 'Natural', right: 'Artificial' }
    }
  },
  content_library: {
    phs_determination: {
      1: 'Focuses on the primitive nature of digestion. You are designed to process one thing at a time. The health of your brain depends on not overloading the digestive system with complex mixtures; simplicity is your medicine.',
      2: "Focuses on a rigid, discriminatory internal system. You are designed to be 'picky.' Your body knows exactly what it needs, and you should never force yourself to eat what does not appeal to your specific, fixed taste.",
      3: 'Focuses on the regulation of body temperature. Your digestion is linked to liquid intake and the heat or cold of what you consume. Manipulating the temperature of your food/drink is your primary biological health lever.',
      4: 'Focuses on the environment around the food. Your digestion is not about what you eat, but the frequency of the room. You need a specific level of activity (Calm or Nervous) to properly metabolize nutrients.',
      5: 'Focuses on acoustic frequency. Your brain is nourished by sound waves while eating. Whether it is high-frequency stimulation or total silence, the sound in the room determines your cellular health.',
      6: "Focuses on the presence of photons. You are a 'Day' or 'Night' eater. Your digestive enzymes are triggered by the sun or the lack thereof, linking your metabolic health to the natural cycles of light."
    },
    phs_environment: {
      1: "You thrive in enclosed, secure spaces with a single point of entry. You need to feel 'behind' something where you can monitor who enters your private domain; security is your foundation.",
      2: "You thrive in urban centers or busy hubs of exchange. Your body stays healthy when you are around the flow of information, goods, and people, allowing you to 'select' your life from a variety of options.",
      3: "You thrive in places of transformation and material 'cooking.' Whether it is a lab, a studio, or a workshop, you need to be where raw energy and materials are being turned into something new.",
      4: "You thrive in high-altitude or high-perspective environments. You need 'thin air' and the ability to look down upon the world. Lower floors or crowded ground levels can feel physically stagnating for you.",
      5: "You thrive at the ground level where the 'acoustic floor' is active. You are here to be where the news, gossip, and social connections travel. Communication and information flow are your natural habitat.",
      6: 'You thrive on the edge or the periphery. Whether it is a beach, a window, or a threshold between two distinct spaces, you are here to be a witness to the transition and the boundary between worlds.'
    },
    psychology_motivation: {
      1: 'Your mind is driven to investigate and reach the bottom of things. You are motivated by the need for a solid foundation of data to feel secure in your existence and your decisions.',
      2: "Your mind is driven by the purity of waiting. You are not here to 'figure it out' through effort, but to remain open and hopeful for the correct sign or miracle that aligns your path.",
      3: 'Your mind is driven by the pursuit of progress and leadership. You are here to be an active force in the material world, pushing for movement, achievement, and tangible change.',
      4: 'Your mind is driven by what is required for the community and the other. You have a social motivation that focuses specifically on what is practical and necessary to address the needs of those around you.',
      5: "Your mind is driven to fix, correct, and influence. You feel a pull to manipulate or 'condition' the frequency of your environment to bring people and situations into a more effective state.",
      6: 'Your mind is driven by pure observation. You are at your best when you have no personal agenda or \'why.\' You are here to be a witness, seeing the world as it is without trying to interfere.'
    },
    psychology_view: {
      1: 'You see the world through the lens of foundational stability. Your eyes naturally scan for what is safe, what is secure, and what is required to maintain a solid base of operations.',
      2: "You see the world through the lens of what could be. Your perspective is naturally drawn to the 'light at the end of the tunnel' and the hidden potential within any person or situation.",
      3: 'You see the world through the lens of hierarchy and material influence. Your eyes naturally track who is in charge, where the resources are, and how power is being utilized in any given space.',
      4: "You see the world through the lens of what is lacking. Your perspective identifies the 'holes' in a plan or person, noticing immediately what is missing or needed to make a situation complete.",
      5: "You see the world through the lens of statistical likelihood. Your eyes aren't looking for miracles; they are looking for what is most likely to happen based on the patterns and frequencies you observe.",
      6: "You see the world as a unique, objective witness. You have a 'Bird's Eye' view that avoids getting caught in the drama of the details, allowing you to see the personal truth of the whole."
    }
    ,
    phs_fixing_library: {
      internal: {
        1: {
          left: 'Consecutive: Eat one food item at a time. Do not mix flavors.',
          right: 'Alternating: You can have variety, but eat them one at a time in a sequence.'
        },
        2: {
          left: 'Open: You need a rotating seasonal menu. New flavors are healthy.',
          right: 'Closed: You need a highly consistent, limited menu of the same foods.'
        },
        3: {
          left: 'Hot: Food and drink must be consumed above body temperature.',
          right: 'Cold: Food and drink must be consumed below body temperature.'
        },
        4: {
          left: 'Calm: You need a quiet, relaxed atmosphere with no distractions.',
          right: 'Nervous: You need buzz, people, or even a TV on while you eat.'
        },
        5: {
          left: 'High Sound: Loud music or active conversation is required.',
          right: 'Low Sound: You need a hushed, quiet environment to digest well.'
        },
        6: {
          left: 'Direct Light: Eat only while the sun is up (Daylight).',
          right: 'Indirect Light: Eat only in the shade or after the sun sets (Night).'
        }
      },
      external: {
        1: {
          left: 'Selective: You must be the one who chooses the space.',
          right: 'Blending: You are found by the space; you merge into it.'
        },
        2: {
          left: 'Internal: You are busy within the market (The Seller).',
          right: 'External: You are observing the market (The Buyer).'
        },
        3: {
          left: 'Wet: You need high humidity or \'wet\' transformative energy.',
          right: 'Dry: You thrive in arid or \'dry\' intellectual/fixed spaces.'
        },
        4: {
          left: 'Active: You need to be physically moving in the mountains.',
          right: 'Passive: You need to be still and observant in the mountains.'
        },
        5: {
          left: 'Narrow: You need intimate, one-on-one communication.',
          right: 'Wide: You need to be in the middle of a large social crowd.'
        },
        6: {
          left: 'Natural: You need raw, wild, un-manicured shorelines.',
          right: 'Artificial: You thrive in man-made boundaries or city edges.'
        }
      }
    }
  },
  cognition_library: {
    1: "Smell: Your intelligence is rooted in the oldest part of the brain. You 'sniff out' the truth, sensing what is safe or suspicious before any words are spoken. You navigate life through an olfactory immune intelligence.",
    2: "Taste: You have a discriminatory intelligence that 'samples' life. You are designed to be selective, only taking in what resonates with your internal frequency. You know instantly if something—or someone—is 'to your taste' or not.",
    3: 'Outer Vision: Your intelligence is visual and strategic. You process information by observing patterns and visual data in the external world. You are here to see clearly and synthesize visual details into a strategic plan.',
    4: "Inner Vision: Your intelligence is conceptual and imaginative. You process information through internal imagery and 'mind-eye' conceptualization. You don't need to see it in the world to understand it; you see it clearly within.",
    5: "Feeling: Your intelligence is electromagnetic and aura-based. You sense the 'vibe' of a room or a person through sensory frequencies. You 'feel' the flow of energy and can detect the emotional or physical state of others instantly.",
    6: "Touch: Your intelligence is acoustic and resonant. You sense the vibration of life. It is a 'knowing' that comes through physical or energetic contact with the frequency of your environment; you hear the truth in the silence."
  },
  asIntKeyedLookup
};
