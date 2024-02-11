import { YogaInitialContext } from "graphql-yoga";
import { Response } from 'express';
import jwt from 'jsonwebtoken'

export function login(username: string, password: string) {
    if (username === 'redcartel' && password === 'password') {
        const token = jwt.sign({
            username: 'redcartel',
            email: 'carteradams@gmail.com'
        }, process.env['JWT_SECRET'] as string)
        return token
    }
    else {
        return undefined;
    }
}