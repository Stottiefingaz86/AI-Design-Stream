import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselContent, Ze } from '../carousel';

const meta = {
  title: 'Lumen/Data Display/Carousel',
  component: Carousel,
} satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Carousel
        arrowsPosition="outside"
        icon="star"
        labels={{
          nextLabel: 'Next slide',
          prevLabel: 'Previous slide',
          seeMoreLabel: 'See More',
          title: 'Popular',
        }}
      >
        <CarouselContent className="-ml-3">
          <Ze index={0} />
          <Ze index={1} />
          <Ze index={2} />
          <Ze index={3} />
          <Ze index={4} />
          <Ze index={5} />
          <Ze index={6} />
          <Ze index={7} />
          <Ze index={8} />
          <Ze index={9} />
        </CarouselContent>
      </Carousel>
    </div>
  ),
};

export const InsideArrows: Story = {
  render: () => (
    <div className="max-w-3xl px-12">
      <Carousel
        arrowsPosition="inside"
        icon="dice"
        labels={{
          nextLabel: 'Next slide',
          prevLabel: 'Previous slide',
          seeMoreLabel: 'See More',
          title: 'Originals',
        }}
      >
        <CarouselContent className="-ml-3">
          <Ze index={0} />
          <Ze index={1} />
          <Ze index={2} />
          <Ze index={3} />
          <Ze index={4} />
          <Ze index={5} />
        </CarouselContent>
      </Carousel>
    </div>
  ),
};
