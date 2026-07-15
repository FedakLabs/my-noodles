давайте додамо expiers_at до checkout 

тоді при початку чекауту ми одразу будемо сетати expires_at і вже відносно цього expires_at будемо відрізняти доступні/заброньовані товари

далі при рахуванні доступних ми суто будемо звертати по products items що є в checkout який Date.now < expires_at & status="pending"
Потім на completed воно так і буде completed (no need to nullify expires_at since either it is canceled or completed, expired checkout's products wont be treated as booked)

so during submit we should check for kind of like computable isCompletable (status="pending" & Date.now() < expires_at)

if everything is fine = we complete

if something off = throw error that checkout is unprocessible

in cron job, it is just best effort moving to correct status. we simply check for checkout which expires_at < Date.now & status="pending" and moving them to canceled with note expired

so basically logic of determining correct expirty time (its duration etc) is just in single place - during creation of checkout

all the other things - are done based on expires_at and status domain saved in db values (no duplication of some application defined variable that may drift away, submits are 100% safe of concurrency due to expiry time & status binding, not on status solely that may be lagging due to cron job)


=====
after nest v12

vitest will be used + ESM

migrate completely to vitest for web and api
migrate completely to esm for web and api

remove completely jest from project
remove completely cjs commonjs etc from a project