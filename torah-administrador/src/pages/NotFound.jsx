import React from 'react';
import { Link } from 'react-router-dom';
import { btn } from '../lib/ui';

const NotFound = () => (
    <div className="py-16 text-center">
        <p className="font-serif text-5xl font-semibold text-gold">404</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold">No encontramos esa página</h1>
        <Link to="/" className={`${btn.primary} mt-6`}>Ir a los libros</Link>
    </div>
);

export default NotFound;
