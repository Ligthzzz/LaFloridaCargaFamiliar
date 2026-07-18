import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsuariosService } from './usuarios/usuarios.service';
import { RolUsuario } from './usuarios/entities/usuario.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  const yaExisteAdmin = await usuariosService.existeAdmin();
  if (yaExisteAdmin) {
    console.log('Ya existe al menos un admin, no se crea uno nuevo.');
    await app.close();
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const rut = process.env.SEED_ADMIN_RUT ?? '11.111.111-4';
  const nombre = process.env.SEED_ADMIN_NOMBRE ?? 'Administrador';

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD deben estar definidos en el .env',
    );
  }

  await usuariosService.create({
    rut,
    nombre,
    email,
    password,
    rol: RolUsuario.ADMIN,
  });

  console.log(`Admin creado: ${email}`);
  await app.close();
}

seed().catch((error) => {
  console.error('Error al ejecutar el seed:', error);
  process.exit(1);
});
