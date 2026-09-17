import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const MovementCTA: React.FC = () => {
  return (
    <div className="py-24 bg-tym-bg">
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-tym-slate mb-6">
          BE PART OF THE MOVEMENT
        </h2>
        <p className="text-lg text-gray-600 mb-12 leading-relaxed">
          Together, let's see a generation awakened, equipped and sent out as
          transformed leaders for the glory of God. Join TCM and be part of
          something greater than yourself.
        </p>
        <Link to="/get-involved">
          <Button variant="primary" size="lg">
            JOIN TCM →
          </Button>
        </Link>
      </div>
    </div>
  );
};
