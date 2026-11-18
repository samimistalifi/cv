import React from 'react';
import {Composition} from 'remotion';
import {DURATION_IN_FRAMES, formats, FPS} from './config';
import {Teaser, TeaserProps} from './Teaser';

const comps: {id: string; props: TeaserProps}[] = [
  {id: 'TeaserEN', props: {lang: 'en', format: 'vertical'}},
  {id: 'TeaserFA', props: {lang: 'fa', format: 'vertical'}},
  {id: 'TeaserENSquare', props: {lang: 'en', format: 'square'}},
  {id: 'TeaserENWide', props: {lang: 'en', format: 'wide'}},
];

export const Root: React.FC = () => (
  <>
    {comps.map(({id, props}) => (
      <Composition
        key={id}
        id={id}
        component={Teaser}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={formats[props.format].width}
        height={formats[props.format].height}
        defaultProps={props}
      />
    ))}
  </>
);
