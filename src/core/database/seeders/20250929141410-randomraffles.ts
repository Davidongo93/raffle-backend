/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// seeds/raffles-seed.ts
import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { DrawMode, RaffleStatus, RaffleType } from '../../../business/raffles/raffle.model';

export default {
    up: async (queryInterface: QueryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            let creatorId: string = '';
            const userPhone = '+573015740156';
            const userName = 'David Orlando Miranda';
            const userEmail = 'david@example.com';

            // Buscar usuario existente
            const [existingUsers]: any = await queryInterface.sequelize.query(
                `SELECT id FROM users WHERE phone = :phone LIMIT 1`,
                {
                    replacements: { phone: userPhone },
                    transaction
                }
            );

            if (existingUsers.length > 0) {
                creatorId = existingUsers[0].id;
                console.log('✅ Usuario existente encontrado con ID:', creatorId);
            } else {
                // Crear nuevo usuario si no existe
                const newUserId = uuidv4();
                await queryInterface.sequelize.query(
                    `INSERT INTO users (id, name, phone, email, "isVerified", "createdAt", "updatedAt") 
           VALUES (:id, :name, :phone, :email, :isVerified, :createdAt, :updatedAt)`,
                    {
                        replacements: {
                            id: newUserId,
                            name: userName,
                            phone: userPhone,
                            email: userEmail,
                            isVerified: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        transaction
                    }
                );

                creatorId = newUserId;
                console.log('✅ Nuevo usuario creado con ID:', creatorId);
            }

            // Definir las rifas
            const raffles = [
                {
                    title: 'Sorteo $2.5 Millones - Dinero en Efectivo, $250.000 Segundo Premio',
                    description: 'Gana $2.5 millones de pesos en efectivo. $250.000 Segundo premio al numero invertido',
                    raffleType: RaffleType.LARGE,
                    ticketPrice: 500,
                    prizeValue: 2500000,
                    secondPrizeValue: 250000,
                    prizeImageUrl: 'https://a.storyblok.com/f/160385/1354x550/a86ff97fe7/anif-efectivo-billetes.webp/m/filters:quality(70)/',
                    drawMode: DrawMode.APP_DRAW,
                    drawDate: new Date('2025-03-15T20:00:00.000Z'),
                    hasSecondPrizeInverted: true,
                    featured: true,
                    status: RaffleStatus.ACTIVE,
                },
                {
                    title: 'Sorteo $100.000 pesos - Dinero en Efectivo',
                    description: 'Gana $100.000 pesos en efectivo. $10.000 Segundo premio al numero invertido',
                    raffleType: RaffleType.SMALL,
                    ticketPrice: 2000,
                    prizeValue: 100000,
                    secondPrizeValue: 10000,
                    prizeImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Bundle_Colombia.jpg/420px-Bundle_Colombia.jpg',
                    drawMode: DrawMode.APP_DRAW,
                    drawDate: new Date('2025-03-15T20:00:00.000Z'),
                    hasSecondPrizeInverted: true,
                    featured: true,
                    status: RaffleStatus.ACTIVE,
                },
                {
                    title: 'Sorteo $5 Millones - Dinero en Efectivo',
                    description: 'Gana $5 millones de pesos en efectivo. $500.000 Segundo premio al numero invertido',
                    raffleType: RaffleType.LARGE,
                    ticketPrice: 1000,
                    prizeValue: 5000000,
                    secondPrizeValue: 500000,
                    prizeImageUrl: 'screaming.jpg',
                    drawMode: DrawMode.APP_DRAW,
                    drawDate: new Date('2025-03-15T20:00:00.000Z'),
                    hasSecondPrizeInverted: true,
                    featured: true,
                    status: RaffleStatus.ACTIVE,
                },
                {
                    title: 'Sorteo $500.000 pesos - Dinero en Efectivo',
                    description: 'Gana $500.000 pesos en efectivo. $50.000 Segundo premio al numero invertido',
                    raffleType: RaffleType.MEDIUM,
                    ticketPrice: 1000,
                    prizeValue: 500000,
                    secondPrizeValue: 50000,
                    prizeImageUrl: 'https://d2yoo3qu6vrk5d.cloudfront.net/pulzo-lite/images-resized/PP3760498A-h-o.webp',
                    drawMode: DrawMode.APP_DRAW,
                    drawDate: new Date('2025-03-15T20:00:00.000Z'),
                    hasSecondPrizeInverted: true,
                    featured: true,
                    status: RaffleStatus.ACTIVE,
                },
                {
                    title: 'Sorteo $1 Millon - Dinero en Efectivo',
                    description: 'Gana $1 millones de pesos en efectivo. $100.000 Segundo premio al numero invertido',
                    raffleType: RaffleType.MEDIUM,
                    ticketPrice: 5000,
                    prizeValue: 1000000,
                    secondPrizeValue: 100000,
                    prizeImageUrl: 'screaming.jpg',
                    drawMode: DrawMode.APP_DRAW,
                    drawDate: new Date('2025-03-15T20:00:00.000Z'),
                    hasSecondPrizeInverted: true,
                    featured: false,
                    status: RaffleStatus.DRAFT,
                },
                // active raffles total prize:
                //  
            ];

            // Preparar rifas para inserción
            const rafflesToInsert = raffles.map(raffle => {
                const raffleId = uuidv4();
                const ticketCount =
                    raffle.raffleType === RaffleType.SMALL ? 100 :
                        raffle.raffleType === RaffleType.MEDIUM ? 1000 : 10000;

                return {
                    ...raffle,
                    id: raffleId,
                    creatorId,
                    tickets: JSON.stringify(Array(ticketCount).fill(false)),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });

            // Insertar rifas
            await queryInterface.bulkInsert('raffles', rafflesToInsert, { transaction });

            // Commit de la transacción
            await transaction.commit();

            console.log(`✅ Seed completado: ${raffles.length} rifas creadas para el usuario ${userName}`);

        } catch (error) {
            // Rollback en caso de error
            await transaction.rollback();
            console.error('❌ Error en el seed:', error);
            throw error;
        }
    },

    down: async (queryInterface: QueryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            const userPhone = '+573015740156';

            // 1. Primero eliminar todas las rifas del usuario
            const [userResult]: any = await queryInterface.sequelize.query(
                `SELECT id FROM users WHERE phone = :phone LIMIT 1`,
                {
                    replacements: { phone: userPhone },
                    transaction
                }
            );

            if (userResult.length > 0) {
                const userId = userResult[0].id;

                // Eliminar rifas del usuario
                await queryInterface.sequelize.query(
                    `DELETE FROM raffles WHERE "creatorId" = :userId`,
                    {
                        replacements: { userId },
                        transaction
                    }
                );

                console.log(`✅ Rifas eliminadas para el usuario con ID: ${userId}`);

                // Opcional: Eliminar el usuario también
                // Si quieres eliminar el usuario, descomenta las siguientes líneas:
                /*
                await queryInterface.sequelize.query(
                  `DELETE FROM users WHERE id = :userId`,
                  {
                    replacements: { userId },
                    transaction
                  }
                );
                console.log(`✅ Usuario eliminado: ${userPhone}`);
                */
            } else {
                console.log('ℹ️ Usuario no encontrado, no hay rifas que eliminar');
            }

            // 2. Alternativa: Eliminar por títulos específicos (más seguro si no quieres eliminar todas las rifas del usuario)
            const raffleTitles = [
                'Sorteo $2.5 Millones - Dinero en Efectivo, $250.000 Segundo Premio',
                'Sorteo $100.000 pesos - Dinero en Efectivo',
                'Sorteo $5 Millones - Dinero en Efectivo',
                'Sorteo $500.000 pesos - Dinero en Efectivo',
                'Sorteo $1 Millon - Dinero en Efectivo'
            ];

            await queryInterface.sequelize.query(
                `DELETE FROM raffles WHERE title IN (:titles)`,
                {
                    replacements: { titles: raffleTitles },
                    transaction
                }
            );

            console.log(`✅ Rifas específicas eliminadas por títulos`);

            await transaction.commit();
            console.log('✅ Rollback del seed completado exitosamente');

        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error en el rollback del seed:', error);
            throw error;
        }
    }
};