// Common memorable words for password generation
export const commonWords = [
  // Animals
  'dog', 'cat', 'bird', 'fish', 'lion', 'bear', 'wolf', 'deer', 'frog', 'duck',
  'horse', 'eagle', 'shark', 'whale', 'tiger', 'snake', 'mouse', 'rabbit', 'fox', 'owl',
  'hawk', 'crow', 'swan', 'goat', 'sheep', 'zebra', 'panda', 'otter', 'seal', 'crab',
  'moth', 'wasp', 'ant', 'bee', 'elk', 'moose', 'bison', 'raven', 'crane', 'heron',
  'turtle', 'lizard', 'parrot', 'falcon', 'dragon', 'monkey', 'donkey', 'camel', 'squid', 'clam',
  'badger', 'jaguar', 'panther', 'viper', 'cobra', 'pelican', 'stork', 'finch', 'wren', 'lark',
  'salmon', 'trout', 'lobster', 'oyster', 'mantis', 'beetle', 'sparrow', 'condor', 'gorilla', 'lemur',
  // Colors
  'red', 'blue', 'green', 'gold', 'pink', 'black', 'white', 'gray',
  'silver', 'bronze', 'coral', 'ivory', 'amber', 'crimson', 'violet', 'indigo',
  'scarlet', 'teal', 'navy', 'maroon', 'olive', 'peach', 'plum', 'rust',
  'cyan', 'khaki', 'beige', 'charcoal', 'cobalt', 'magenta', 'topaz', 'onyx',
  // Nature
  'tree', 'star', 'moon', 'sun', 'rain', 'snow', 'wind', 'leaf', 'rock',
  'river', 'lake', 'ocean', 'cloud', 'storm', 'flame', 'frost', 'stone', 'sand',
  'cliff', 'cave', 'peak', 'vale', 'marsh', 'brook', 'creek', 'pond', 'reef',
  'grove', 'field', 'meadow', 'forest', 'desert', 'island', 'glacier', 'canyon', 'volcano',
  'thunder', 'lightning', 'breeze', 'tide', 'wave', 'pebble', 'boulder', 'crystal',
  'rapids', 'geyser', 'lagoon', 'ravine', 'thicket', 'swamp', 'dune', 'fjord', 'gorge',
  // Food
  'cake', 'milk', 'bread', 'apple', 'pizza', 'rice', 'corn', 'meat',
  'grape', 'lemon', 'mango', 'berry', 'honey', 'butter', 'cheese', 'bacon',
  'steak', 'pasta', 'toast', 'sugar', 'spice', 'candy', 'cream', 'syrup',
  'salad', 'soup', 'taco', 'curry', 'sushi', 'melon', 'cherry', 'walnut',
  'almond', 'ginger', 'pepper', 'onion', 'garlic', 'cocoa', 'pretzel', 'waffle',
  'nutmeg', 'basil', 'thyme', 'cumin', 'fennel', 'turnip', 'radish', 'celery',
  // Actions
  'jump', 'run', 'swim', 'fly', 'sing', 'dance', 'laugh', 'smile',
  'climb', 'crawl', 'drift', 'float', 'glide', 'march', 'slide', 'spin',
  'throw', 'catch', 'pull', 'push', 'lift', 'drop', 'kick', 'shout',
  'whisper', 'roar', 'bloom', 'spark', 'flash', 'crash', 'splash', 'twist',
  'fold', 'build', 'carve', 'paint', 'write', 'draw', 'craft', 'soar',
  'dive', 'leap', 'dash', 'bolt', 'charge', 'sprint', 'stride', 'launch',
  'forge', 'grind', 'hoist', 'lunge', 'plunge', 'reach', 'scout', 'steer',
  'weave', 'wield', 'grasp', 'hurdle', 'juggle', 'tumble', 'pivot', 'fling',
  // Objects
  'book', 'desk', 'lamp', 'door', 'key', 'ring', 'box', 'cup', 'pen',
  'bell', 'drum', 'flute', 'horn', 'harp', 'coin', 'gem', 'crown', 'shield',
  'sword', 'arrow', 'blade', 'chain', 'rope', 'wheel', 'clock', 'mirror', 'candle',
  'bridge', 'tower', 'castle', 'cabin', 'fence', 'gate', 'arch', 'pillar', 'throne',
  'hammer', 'anvil', 'chisel', 'needle', 'thread', 'ribbon', 'banner', 'flag', 'kite',
  'anchor', 'compass', 'lantern', 'basket', 'bucket', 'barrel', 'crate', 'vault', 'chest',
  'prism', 'scroll', 'goblet', 'dagger', 'spear', 'quill', 'locket', 'brooch', 'scepter',
  'furnace', 'beacon', 'mortar', 'pestle', 'tripod', 'wrench', 'lever', 'pulley', 'spindle',
  // Adjectives
  'big', 'small', 'fast', 'slow', 'hot', 'cold', 'new', 'old', 'soft',
  'hard', 'bright', 'dark', 'loud', 'quiet', 'sharp', 'smooth', 'rough', 'tough',
  'wild', 'calm', 'brave', 'bold', 'keen', 'wise', 'kind', 'fair', 'pure',
  'swift', 'strong', 'proud', 'grand', 'noble', 'vivid', 'fierce', 'gentle', 'humble',
  'lucky', 'happy', 'merry', 'jolly', 'witty', 'clever', 'mighty', 'steady', 'silent',
  'crisp', 'dense', 'agile', 'rapid', 'stark', 'brisk', 'nimble', 'rugged', 'sturdy',
  'golden', 'hollow', 'frozen', 'molten', 'frosty', 'stormy', 'dusty', 'rustic', 'serene',
  // Places & Geography
  'north', 'south', 'east', 'west', 'coast', 'shore', 'harbor', 'port', 'bay',
  'ridge', 'summit', 'valley', 'plain', 'delta', 'oasis', 'tundra', 'jungle', 'savanna',
  'mesa', 'bluff', 'atoll', 'steppe', 'plateau', 'inlet', 'hamlet', 'outpost', 'citadel',
  // Time & Seasons
  'dawn', 'dusk', 'noon', 'night', 'spring', 'summer', 'autumn', 'winter', 'epoch',
  'moment', 'decade', 'century', 'sunset', 'sunrise', 'twilight', 'midnight', 'morning',
  'solstice', 'equinox', 'harvest', 'crescent', 'waning', 'eternal', 'ancient', 'fleeting',
  // Materials & Elements
  'iron', 'steel', 'copper', 'brass', 'glass', 'silk', 'wool', 'linen', 'velvet',
  'marble', 'granite', 'jade', 'ruby', 'pearl', 'diamond', 'emerald', 'sapphire', 'opal',
  'nickel', 'chrome', 'titanium', 'quartz', 'obsidian', 'bamboo', 'cedar', 'birch', 'aspen',
  // Weather & Sky
  'fog', 'mist', 'haze', 'sleet', 'hail', 'blizzard', 'rainbow', 'aurora', 'comet',
  'meteor', 'nebula', 'eclipse', 'horizon', 'zenith', 'orbit', 'cosmos', 'galaxy', 'nova',
  'cirrus', 'nimbus', 'stratus', 'tempest', 'cyclone', 'monsoon', 'tornado', 'flurry', 'squall',
  // Music & Sound
  'chord', 'rhythm', 'melody', 'tempo', 'bass', 'treble', 'hymn', 'chant', 'echo',
  'whistle', 'rumble', 'murmur', 'chime', 'clang', 'buzz', 'hum', 'snap', 'click',
  'ballad', 'sonata', 'fugue', 'riff', 'verse', 'chorus', 'strum', 'pluck', 'tone',
  // Body & Movement
  'heart', 'bone', 'fist', 'palm', 'wrist', 'spine', 'skull', 'wing', 'claw',
  'talon', 'tusk', 'mane', 'tail', 'scale', 'shell', 'feather', 'fur', 'antler',
  'sinew', 'tendon', 'muscle', 'marrow', 'breath', 'pulse', 'gait', 'pounce', 'prowl',
  // Abstract & Concepts
  'dream', 'hope', 'fate', 'charm', 'spirit', 'quest', 'myth', 'legend', 'saga',
  'glory', 'honor', 'valor', 'grace', 'truth', 'power', 'force', 'logic', 'chaos',
  'riddle', 'puzzle', 'cipher', 'rune', 'sigil', 'token', 'omen', 'vow', 'oath',
  'virtue', 'wisdom', 'enigma', 'paradox', 'karma', 'aura', 'mantra', 'nexus', 'creed',
  'axiom', 'flux', 'ember', 'vigor', 'grit', 'zeal', 'bliss', 'poise', 'ethos'
];