import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TrabajadorRegistro from './TrabajadorRegistro';
import TrabajadorAuth from './TrabajadorAuth';

const TrabajadorLayout = () => {
    return (
        <div className="min-h-screen">
            <Routes>
                <Route path="/" element={<TrabajadorAuth />} />
                <Route path="/registro/:trabajadorId" element={<TrabajadorRegistro />} />
            </Routes>
        </div>
    );
};

export default TrabajadorLayout;
