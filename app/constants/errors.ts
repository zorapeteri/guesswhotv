export type ErrorProps = {
  img: {
    src: string
    alt: string
  }
  heading: string
  description: string
}

const errors = {
  '404': {
    img: {
      src: '/images/vincent.gif',
      alt: 'vincent vega (john travolta) from pulp fiction looking around, confused',
    },
    heading: '404',
    description: 'looks like this one is a dead end:/',
  },
  'too-few-characters': {
    img: {
      src: '/images/muffin.gif',
      alt: `Cartoon gif. A sad pink bunny swings slowly back and forth on a playground swing, eyes downcast and ears slumped.`,
    },
    heading: 'Oh no 😭',
    description: `It looks like there's not enough characters available in this show to play Guess Who.`,
  },
  unknown: {
    img: {
      src: '/images/areyougoingtomissyourmom.gif',
      alt: `pre-kindergarten boy crying during a TV interview, hiding his face with his hands`,
    },
    heading: 'Uh oh. Something went wrong.',
    description: `Looks like this one is on me. I can't promise that trying again in a bit will work, but it just might.`,
  },
} as const

export type ErrorCode = keyof typeof errors

export default errors
