import { PrismaClient, AppointmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Наполнение базы данных СТО «VN SERVICE» (г. Астана)...");

  // Очистка предыдущих записей
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.station.deleteMany();

  // 1. Создаем автосервис VN SERVICE
  const station = await prisma.station.create({
    data: {
      name: "СТО «VN SERVICE»",
      address: "г. Астана, район Байконыр, пр. Акжол, 52/1",
      phone: "+7 (771) 534-86-56",
    },
  });

  console.log(`✓ Создана станция: ${station.name}`);

  // 2. Создаем команду мастеров VN SERVICE
  const mechanics = await Promise.all([
    prisma.mechanic.create({
      data: {
        stationId: station.id,
        name: "Руслан Касымов",
        specialty: "Старший диагност / Автоэлектрик",
      },
    }),
    prisma.mechanic.create({
      data: {
        stationId: station.id,
        name: "Алишер Нурпеисов",
        specialty: "Моторист / ДВС и МКПП",
      },
    }),
    prisma.mechanic.create({
      data: {
        stationId: station.id,
        name: "Бахтияр Сыздыков",
        specialty: "Мастер по ходовой части и тормозным системам",
      },
    }),
    prisma.mechanic.create({
      data: {
        stationId: station.id,
        name: "Тимур Искаков",
        specialty: "Специалист по автоклимату и ТО",
      },
    }),
  ]);

  console.log(`✓ Создано мастеров: ${mechanics.length}`);

  // 3. Создаем официальные услуги VN SERVICE с реальными ценами в тенге (₸)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Диагностика ходовой части (Акция до 12:00)",
        description: "Осмотр сайлентблоков, амортизаторов, рычагов, рулевой рейки и тормозной системы. Бесплатно при утренней записи!",
        durationMinutes: 45,
        price: 0,
      },
    }),
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Комплексная компьютерная диагностика ЭБУ",
        description: "Чтение и стирание кодов ошибок всех систем (ДВС, ABS, SRS, коробка), онлайн-параметры датчиков",
        durationMinutes: 45,
        price: 7000,
      },
    }),
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Замена моторного масла и фильтров",
        description: "Слив или аппаратная откачка отработанного масла, замена масляного и воздушного фильтра, осмотр течей",
        durationMinutes: 45,
        price: 4500,
      },
    }),
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Ремонт ходовой части и рулевого управления",
        description: "Замена рычагов, сайлентблоков, рулевых наконечников, втулок и стоек стабилизатора",
        durationMinutes: 90,
        price: 12000,
      },
    }),
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Замена тормозных колодок + ревизия суппортов",
        description: "Очистка суппортов, смазка направляющих пальцев термостойкой пастой, установка колодок",
        durationMinutes: 60,
        price: 6000,
      },
    }),
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Заправка и диагностика автокондиционера",
        description: "Вакуумирование системы, проверка на герметичность, заправка хладагентом R134a и компрессорным маслом",
        durationMinutes: 60,
        price: 12000,
      },
    }),
    prisma.service.create({
      data: {
        stationId: station.id,
        name: "Подбор и экспресс-доставка запчастей со склада VN",
        description: "Мгновенный подбор оригиналов и качественных дубликатов по VIN-коду с гарантией совместимости",
        durationMinutes: 15,
        price: 0,
      },
    }),
  ]);

  console.log(`✓ Создано услуг: ${services.length}`);

  // 4. Реалистичные записи на сегодня для демонстрации дашборда (номера Астаны - регион 01)
  const today = new Date();
  const timeToday = (hours: number, minutes = 0) => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  await Promise.all([
    prisma.appointment.create({
      data: {
        stationId: station.id,
        serviceId: services[2].id, // Замена масла
        mechanicId: mechanics[2].id,
        startTime: timeToday(9, 30),
        endTime: timeToday(10, 15),
        clientName: "Арман Жумагулов",
        clientPhone: "+7 (771) 999-11-22",
        carMake: "Toyota",
        carModel: "Land Cruiser Prado 150",
        carPlateNumber: "010 VNN 01",
        problemDesc: "Замена моторного масла 5W-30 + масляный и салонный фильтры",
        photoUrls: [
          "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
        ],
        status: AppointmentStatus.IN_PROGRESS,
      },
    }),
    prisma.appointment.create({
      data: {
        stationId: station.id,
        serviceId: services[1].id, // Компьютерная диагностика
        mechanicId: mechanics[0].id,
        startTime: timeToday(11, 0),
        endTime: timeToday(11, 45),
        clientName: "Мурат Смагулов",
        clientPhone: "+7 (701) 333-44-55",
        carMake: "BMW",
        carModel: "X6 F16",
        carPlateNumber: "777 AAA 01",
        problemDesc: "Ошибка Drivetrain на мониторе, троит на холостых оборотах",
        photoUrls: [
          "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800",
        ],
        status: AppointmentStatus.WAITING_PARTS,
      },
    }),
    prisma.appointment.create({
      data: {
        stationId: station.id,
        serviceId: services[4].id, // Тормозные колодки
        mechanicId: mechanics[2].id,
        startTime: timeToday(13, 0),
        endTime: timeToday(14, 0),
        clientName: "Айгерим Бекенова",
        clientPhone: "+7 (747) 555-88-99",
        carMake: "Hyundai",
        carModel: "Santa Fe",
        carPlateNumber: "452 AST 01",
        problemDesc: "Скрип при торможении на малой скорости, проверить толщину дисков",
        photoUrls: [],
        status: AppointmentStatus.READY,
      },
    }),
    prisma.appointment.create({
      data: {
        stationId: station.id,
        serviceId: services[0].id, // Диагностика ходовой (акция)
        mechanicId: mechanics[3].id,
        startTime: timeToday(15, 30),
        endTime: timeToday(16, 15),
        clientName: "Даурен Калиев",
        clientPhone: "+7 (708) 123-98-76",
        carMake: "Kia",
        carModel: "K5",
        carPlateNumber: "888 KZZ 01",
        problemDesc: "Стук спереди справа при проезде лежачих полицейских",
        photoUrls: [],
        status: AppointmentStatus.CONFIRMED,
      },
    }),
  ]);

  console.log("✅ СТО «VN SERVICE» (Астана) успешно настроено в базе данных!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
