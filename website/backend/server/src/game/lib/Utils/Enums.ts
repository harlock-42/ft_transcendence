export enum GameState
{
  Undef,
  SetUp,
  Running,
  Paused,
  Goal,
  ShutDown,
}

export enum PadAlignment
{
  LEFT,
  RIGHT,
}

export enum MoveActionEvent
{
  MOVE_UP,
  MOVE_DOWN,
}

export enum ScoreActionEvent
{
  LEFT_PLAYER_SCORED,
  RIGHT_PLAYER_SCORED,
}
