import React from 'react';
import { Button } from './button';

export function QuantitySelector({ quantity, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onDecrease}
        disabled={quantity <= 1}
      >
        -
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={onIncrease}
      >
        +
      </Button>
      {onRemove && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="ml-2"
        >
          Eliminar
        </Button>
      )}
    </div>
  );
}