create table subscriptions
(
    id serial not null
        constraint subscriptions_pk
            primary key,
    subscription jsonb not null
);
