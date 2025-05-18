import {
  createRoute,
  type AnyRoute,
  type RootRoute,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

const timeFormats = [
  "1+0",
  "1+1",
  "2+1",
  "3+0",
  "3+2",
  "5+0",
  "5+3",
  "10+0",
  "10+5",
  "15+10",
  "30+0",
  "60+0",
  "60+30",
  "90+30",
  "120+0",
];

function ChooseTimeFormat() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-around my-10">
      <img src="/chess-board.png" alt="Chessboard" className="aspect-square" />
      <div className="flex flex-col justify-around gap-8 p-24 lg:p-48 bg-neutral rounded-lg">
        <h2 className="text-3xl font-bold">Choose the time format</h2>
        <div className="grid grid-cols-3 gap-4">
          {timeFormats.map((tf) => (
            <Link
              to="/game"
              search={{
                timeFormat: tf,
              }}
              key={tf}
              className="btn btn-info btn-soft"
            >
              {tf}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/choose-time",
    component: ChooseTimeFormat,
    getParentRoute: () => parentRoute,
  });
