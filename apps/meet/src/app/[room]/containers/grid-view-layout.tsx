import { FC } from 'react'
import { map } from 'lodash'

const GAP = 16;

type Props = {
  renderItem: (item: number) => React.ReactNode;
  items: any[];
}

export const GridViewLayout:FC<Props> = ({renderItem,items}) => {
  const totalUser = items.length;
  const columns = Math.ceil(Math.sqrt(totalUser)); // Cột dựa trên căn bậc 2 của n
  const rows = Math.ceil(totalUser / columns); // Hàng dựa trên việc chia đều số theo hàng
  const leftoverItems = totalUser % columns; // Tính số phần tử thừa
  const checkFullRow = columns * rows === totalUser;

  return (
    <div
      className={"grid w-screen h-screen duration-300"}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        padding: `${GAP}px`,
        gap: `${GAP}px`,
      }}
    >
      {map(items,(item, index) => {
        const isLeftover = index >= totalUser - leftoverItems;
        const transformValue =
          leftoverItems > 0 && isLeftover
            ? `translateX(calc(${50 * (rows * columns - totalUser)}% + ${
              (rows * columns - totalUser) * (GAP / 2)
            }px))`
            : "unset";

        return (
          <div
            key={index}
            className={"w-full h-full duration-300"}
            style={{
              transform: checkFullRow ? "unset" : transformValue,
            }}
          >
            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
}

