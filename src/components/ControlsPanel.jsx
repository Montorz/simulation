export default function ControlsPanel({ params, onParamsChange }) {
  return (
    <div className="controls">
      <h3>Управление экосистемой</h3>
      
      <div className="control-group">
        <label>
          Хищники: {params.predatorCount}
          <input
            type="range"
            min="1"
            max="20"
            value={params.predatorCount}
            onChange={(e) => onParamsChange({ ...params, predatorCount: +e.target.value })}
          />
        </label>

        <label>
          Скорость хищников: {params.predatorSpeed.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={params.predatorSpeed}
            onChange={(e) => onParamsChange({ ...params, predatorSpeed: +e.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Жертвы: {params.preyCount}
          <input
            type="range"
            min="1"
            max="50"
            value={params.preyCount}
            onChange={(e) => onParamsChange({ ...params, preyCount: +e.target.value })}
          />
        </label>

        <label>
          Скорость жертв: {params.preySpeed.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={params.preySpeed}
            onChange={(e) => onParamsChange({ ...params, preySpeed: +e.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Трава: {params.foodCount}
          <input
            type="range"
            min="10"
            max="200"
            value={params.foodCount}
            onChange={(e) => onParamsChange({ ...params, foodCount: +e.target.value })}
          />
        </label>

        <label>
          Шанс размножения жертв (%):
          <input
            type="range"
            min="0"
            max="20"
            value={params.preyReproductionChance}
            onChange={(e) => onParamsChange({ ...params, preyReproductionChance: +e.target.value })}
          />
          {params.preyReproductionChance}%
        </label>
      </div>
    </div>
  );
}